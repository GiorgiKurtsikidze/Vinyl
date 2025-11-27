import { useEffect, useMemo, useState } from 'react';
import type { User } from 'firebase/auth';
import { onAuthStateChanged } from 'firebase/auth';
import {
  addDoc,
  collection,
  deleteDoc,
  doc,
  onSnapshot,
  serverTimestamp,
  updateDoc,
  type CollectionReference,
  type DocumentData,
} from 'firebase/firestore';
import {
  BarChart2,
  Download,
  Filter,
  Plus,
  Trash2,
  UploadCloud,
  WandSparkles,
} from 'lucide-react';
import { auth, db, defaultAppScope, ensureAuth } from './lib/firebase';
import { parseUpdatesWithAI, type StructuredDealInput } from './lib/ai';
import type { DealInput, DealRecord, DealStatus } from './types/deal';
import { DEAL_STATUSES } from './types/deal';

const GEO_OPTIONS = ['UK', 'DE', 'NL'];
const SOURCE_OPTIONS = ['PPC', 'SEO', 'FB', 'SMS', 'EMAIL', 'RETARGETING'];
const MODEL_OPTIONS = ['CPA', 'RS', 'Hybrid'];

const STATUS_BADGES: Record<DealStatus, string> = {
  Prospecting: 'bg-blue-100 text-blue-800 border border-blue-200',
  Negotiating: 'bg-yellow-100 text-yellow-800 border border-yellow-200',
  Onboarding: 'bg-purple-100 text-purple-800 border border-purple-200',
  Live: 'bg-green-100 text-green-800 border border-green-200',
  Paused: 'bg-gray-100 text-gray-800 border border-gray-200',
  Rejected: 'bg-red-100 text-red-800 border border-red-200',
};

const defaultDealValues: DealInput = {
  name: '',
  geo: 'UK',
  source: 'PPC',
  model: 'CPA',
  status: 'Prospecting',
  details: '',
  next: '',
};

const fallbackCollectionTemplate = 'artifacts/{APP_ID}/public/data/deals';

type Filters = {
  geo: string;
  model: string;
  status: string;
};

function resolveDealsCollection(appScope: string) {
  const template =
    import.meta.env.VITE_FIRESTORE_COLLECTION_PATH ?? fallbackCollectionTemplate;
  const normalized = template.replaceAll('{APP_ID}', appScope);
  const segments = normalized.split('/').filter(Boolean);
  const [first, ...rest] = segments.length ? segments : ['deals'];
  return collection(db, first, ...rest);
}

function sanitizeStatus(status?: string): DealStatus | undefined {
  if (!status) return undefined;
  const normalized = status.trim().toLowerCase();
  const match = DEAL_STATUSES.find((candidate) => candidate.toLowerCase() === normalized);
  return match;
}

function mapStructuredDeal(
  structured: StructuredDealInput,
  mode: 'merge' | 'create',
): Partial<DealInput> {
  const payload: Partial<DealInput> = mode === 'create' ? { ...defaultDealValues } : {};
  const normalizedName = structured.name?.trim();
  if (normalizedName && mode === 'create') {
    payload.name = normalizedName;
  }
  const geo = structured.geo?.trim();
  if (geo) payload.geo = geo;
  const source = structured.source?.trim();
  if (source) payload.source = source;
  const model = structured.model?.trim();
  if (model) payload.model = model;
  if (typeof structured.details === 'string') {
    payload.details = structured.details.trim();
  }
  if (typeof structured.next === 'string') {
    payload.next = structured.next.trim();
  }
  const status = sanitizeStatus(structured.status);
  if (status) {
    payload.status = status;
  } else if (mode === 'create' && !payload.status) {
    payload.status = defaultDealValues.status;
  }
  return payload;
}

function App() {
  const [user, setUser] = useState<User | null>(null);
  const [deals, setDeals] = useState<DealRecord[]>([]);
  const [loadingDeals, setLoadingDeals] = useState(true);
  const [globalError, setGlobalError] = useState<string | null>(null);
  const [infoMessage, setInfoMessage] = useState<string | null>(null);
  const [filters, setFilters] = useState<Filters>({ geo: '', model: '', status: '' });
  const [importModalOpen, setImportModalOpen] = useState(false);
  const [importText, setImportText] = useState('');
  const [importing, setImporting] = useState(false);
  const [aiInput, setAiInput] = useState('');
  const [aiSummary, setAiSummary] = useState<string | null>(null);
  const [aiError, setAiError] = useState<string | null>(null);
  const [aiLoading, setAiLoading] = useState(false);

  const appScope = defaultAppScope;
  const dealsCollection = useMemo<CollectionReference<DocumentData>>(
    () => resolveDealsCollection(appScope),
    [appScope],
  );

  useEffect(() => {
    ensureAuth().catch((err) => setGlobalError(err.message));
    const unsubscribe = onAuthStateChanged(auth, (authUser) => {
      setUser(authUser);
    });
    return unsubscribe;
  }, []);

  useEffect(() => {
    if (!user) return;
    setLoadingDeals(true);
    const unsubscribe = onSnapshot(
      dealsCollection,
      (snapshot) => {
        const nextDeals: DealRecord[] = snapshot.docs
          .map((docSnap) => ({
            id: docSnap.id,
            ...(docSnap.data() as Omit<DealRecord, 'id'>),
          }))
          .sort((a, b) => {
            const aSeconds = a.createdAt && 'seconds' in a.createdAt ? a.createdAt.seconds ?? 0 : 0;
            const bSeconds = b.createdAt && 'seconds' in b.createdAt ? b.createdAt.seconds ?? 0 : 0;
            return bSeconds - aSeconds;
          });
        setDeals(nextDeals);
        setLoadingDeals(false);
      },
      (err) => {
        setGlobalError(err.message);
        setLoadingDeals(false);
      },
    );
    return unsubscribe;
  }, [dealsCollection, user]);

  const filteredDeals = useMemo(() => {
    return deals.filter((deal) => {
      if (filters.geo && deal.geo !== filters.geo) return false;
      if (filters.model && deal.model !== filters.model) return false;
      if (filters.status && deal.status !== filters.status) return false;
      return true;
    });
  }, [deals, filters]);

  const statusSummary = useMemo(() => {
    if (!deals.length) return 'No active deals yet';
    const counts = deals.reduce<Record<string, number>>((acc, deal) => {
      acc[deal.status] = (acc[deal.status] || 0) + 1;
      return acc;
    }, {});
    return Object.entries(counts)
      .map(([status, count]) => `${status}: ${count}`)
      .join(' | ');
  }, [deals]);

  const handleAddDeal = async () => {
    if (!user) return;
    try {
      await addDoc(dealsCollection, {
        ...defaultDealValues,
        createdAt: serverTimestamp(),
      });
    } catch (err) {
      setGlobalError(err instanceof Error ? err.message : 'Failed to add deal.');
    }
  };

  const handleUpdateField = async (id: string, field: keyof DealRecord, value: string) => {
    if (!user) return;
    try {
      await updateDoc(doc(dealsCollection, id), { [field]: value });
    } catch (err) {
      setGlobalError(err instanceof Error ? err.message : 'Failed to update deal.');
    }
  };

  const handleDeleteDeal = async (id: string) => {
    if (!user) return;
    if (!window.confirm('Delete this deal permanently?')) return;
    try {
      await deleteDoc(doc(dealsCollection, id));
    } catch (err) {
      setGlobalError(err instanceof Error ? err.message : 'Failed to delete deal.');
    }
  };

  const handleRunImport = async () => {
    if (!user) return;
    setImporting(true);
    setInfoMessage(null);
    setGlobalError(null);
    try {
      const parsed = JSON.parse(importText);
      if (!Array.isArray(parsed)) {
        throw new Error('JSON must be an array of deal objects.');
      }
      for (const item of parsed) {
        const structured = item as StructuredDealInput;
        const payload = mapStructuredDeal(structured, 'create');
        if (!payload.name) {
          throw new Error('Each imported deal must include a "name" field.');
        }
        await addDoc(dealsCollection, {
          ...payload,
          name: payload.name,
          createdAt: serverTimestamp(),
        });
      }
      setInfoMessage(`Imported ${parsed.length} deals successfully.`);
      setImportText('');
      setImportModalOpen(false);
    } catch (err) {
      setGlobalError(err instanceof Error ? err.message : 'Import failed.');
    } finally {
      setImporting(false);
    }
  };

  const handleExport = () => {
    if (!deals.length) return;
    const headers = ['Partner Name', 'Geo', 'Source', 'Model', 'Status', 'Details', 'Next Steps'];
    const rows = deals.map((deal) => [
      `"${(deal.name || '').replace(/"/g, '""')}"`,
      deal.geo || '',
      deal.source || '',
      deal.model || '',
      deal.status || '',
      `"${(deal.details || '').replace(/"/g, '""')}"`,
      `"${(deal.next || '').replace(/"/g, '""')}"`,
    ]);
    const csvContent = [headers.join(','), ...rows.map((row) => row.join(','))].join('\n');
    const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
    const link = document.createElement('a');
    link.href = URL.createObjectURL(blob);
    link.download = 'deals_export.csv';
    link.click();
    URL.revokeObjectURL(link.href);
  };

  const handleAiIngest = async () => {
    if (!user) {
      setAiError('Please wait for Firebase auth to complete.');
      return;
    }
    setAiLoading(true);
    setAiSummary(null);
    setAiError(null);
    try {
      const result = await parseUpdatesWithAI(aiInput);
      if (!result.deals.length) {
        throw new Error('AI could not find any deals in the update.');
      }
      const existing = new Map(
        deals
          .filter((deal) => deal.name)
          .map((deal) => [deal.name.trim().toLowerCase(), deal]),
      );
      let created = 0;
      let updated = 0;
      for (const structured of result.deals) {
        const normalizedName = structured.name?.trim();
        if (!normalizedName) continue;
        const match = existing.get(normalizedName.toLowerCase());
        if (match) {
          const payload = mapStructuredDeal(structured, 'merge');
          if (Object.keys(payload).length) {
            await updateDoc(doc(dealsCollection, match.id), payload);
            updated += 1;
          }
        } else {
          const createPayload = mapStructuredDeal(structured, 'create');
          await addDoc(dealsCollection, {
            ...createPayload,
            name: normalizedName,
            createdAt: serverTimestamp(),
          });
          created += 1;
        }
      }
      setAiSummary(
        [
          created ? `${created} new ${created === 1 ? 'deal' : 'deals'} added` : null,
          updated ? `${updated} updated` : null,
          result.summary ? `Summary: ${result.summary}` : null,
        ]
          .filter(Boolean)
          .join(' • '),
      );
      setAiInput('');
    } catch (err) {
      setAiError(err instanceof Error ? err.message : 'Failed to process updates with AI.');
    } finally {
      setAiLoading(false);
    }
  };

  const resetFilters = () => setFilters({ geo: '', model: '', status: '' });

  const renderTableBody = () => {
    if (loadingDeals) {
      return (
        <tr>
          <td colSpan={9} className="text-center py-10 text-gray-400">
            Loading data...
          </td>
        </tr>
      );
    }
    if (!filteredDeals.length) {
      return (
        <tr>
          <td colSpan={9} className="text-center py-10 text-gray-400">
            No deals found. Click “New Deal” to start.
          </td>
        </tr>
      );
    }
    return filteredDeals.map((deal, index) => (
      <tr key={deal.id} className="border-b border-gray-50 last:border-0 hover:bg-gray-50 group">
        <td className="text-center text-gray-400 text-xs py-3">{index + 1}</td>
        <td className="border-r border-gray-100">
          <input
            className="cell-input font-medium text-gray-900"
            value={deal.name || ''}
            onChange={(event) => handleUpdateField(deal.id, 'name', event.target.value)}
          />
        </td>
        <td className="border-r border-gray-100">
          <select
            className="cell-input text-gray-600"
            value={deal.geo || ''}
            onChange={(event) => handleUpdateField(deal.id, 'geo', event.target.value)}
          >
            <option value="">-</option>
            {GEO_OPTIONS.map((geo) => (
              <option key={geo} value={geo}>
                {geo}
              </option>
            ))}
          </select>
        </td>
        <td className="border-r border-gray-100">
          <select
            className="cell-input text-gray-600"
            value={deal.source || ''}
            onChange={(event) => handleUpdateField(deal.id, 'source', event.target.value)}
          >
            <option value="">-</option>
            {SOURCE_OPTIONS.map((source) => (
              <option key={source} value={source}>
                {source}
              </option>
            ))}
          </select>
        </td>
        <td className="border-r border-gray-100">
          <select
            className="cell-input text-gray-600"
            value={deal.model || ''}
            onChange={(event) => handleUpdateField(deal.id, 'model', event.target.value)}
          >
            <option value="">-</option>
            {MODEL_OPTIONS.map((model) => (
              <option key={model} value={model}>
                {model}
              </option>
            ))}
          </select>
        </td>
        <td className="border-r border-gray-100">
          <select
            className={`cell-input text-xs font-semibold rounded ${
              STATUS_BADGES[deal.status as DealStatus] ??
              'bg-gray-100 text-gray-800 border border-gray-200'
            }`}
            value={deal.status}
            onChange={(event) =>
              handleUpdateField(deal.id, 'status', event.target.value as DealStatus)
            }
          >
            {DEAL_STATUSES.map((status) => (
              <option key={status} value={status}>
                {status}
              </option>
            ))}
          </select>
        </td>
        <td className="border-r border-gray-100">
          <input
            className="cell-input text-gray-600"
            value={deal.details || ''}
            onChange={(event) => handleUpdateField(deal.id, 'details', event.target.value)}
          />
        </td>
        <td className="border-r border-gray-100">
          <input
            className="cell-input text-gray-600"
            value={deal.next || ''}
            onChange={(event) => handleUpdateField(deal.id, 'next', event.target.value)}
          />
        </td>
        <td className="text-center">
          <button
            onClick={() => handleDeleteDeal(deal.id)}
            className="text-gray-300 hover:text-red-500 opacity-0 group-hover:opacity-100 transition p-2"
          >
            <Trash2 size={16} />
          </button>
        </td>
      </tr>
    ));
  };

  return (
    <div className="h-full flex flex-col bg-gray-50 text-sm text-gray-800">
      <header className="bg-white border-b border-gray-200 px-6 py-4 shadow-sm space-y-4">
        <div className="flex flex-col gap-4 lg:flex-row lg:items-center lg:justify-between">
          <div className="flex items-center gap-3">
            <div className="bg-blue-600 p-2 rounded-lg text-white shadow-md">
              <BarChart2 className="w-6 h-6" />
            </div>
            <div>
              <h1 className="text-xl font-bold text-gray-900 tracking-tight">Affiliate Pipeline</h1>
              <p id="statusSummary" className="text-gray-500 text-xs mt-0.5 font-medium">
                {statusSummary}
              </p>
            </div>
          </div>
          <div className="flex flex-wrap gap-2">
            <button
              onClick={() => setImportModalOpen(true)}
              className="flex items-center gap-2 bg-gray-100 hover:bg-gray-200 text-gray-700 px-3 py-2 rounded-md font-medium transition border border-gray-200"
            >
              <UploadCloud size={16} /> Import
            </button>
            <button
              onClick={handleExport}
              className="flex items-center gap-2 bg-white hover:bg-gray-50 text-gray-700 px-3 py-2 rounded-md font-medium transition border border-gray-200"
            >
              <Download size={16} /> Export
            </button>
            <button
              onClick={handleAddDeal}
              className="flex items-center gap-2 bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded-md font-medium transition shadow-sm"
            >
              <Plus size={16} /> New Deal
            </button>
          </div>
        </div>

        <div className="flex gap-3 items-center bg-gray-100/50 p-3 rounded-lg overflow-x-auto border border-gray-200">
          <Filter className="w-4 h-4 text-gray-400 ml-1" />
          <select
            value={filters.geo}
            onChange={(event) => setFilters((prev) => ({ ...prev, geo: event.target.value }))}
            className="bg-white border border-gray-200 rounded px-2 py-1.5 text-xs font-medium focus:ring-2 focus:ring-blue-500 outline-none shadow-sm"
          >
            <option value="">All Geos</option>
            {GEO_OPTIONS.map((geo) => (
              <option key={geo} value={geo}>
                {geo}
              </option>
            ))}
          </select>
          <select
            value={filters.model}
            onChange={(event) => setFilters((prev) => ({ ...prev, model: event.target.value }))}
            className="bg-white border border-gray-200 rounded px-2 py-1.5 text-xs font-medium focus:ring-2 focus:ring-blue-500 outline-none shadow-sm"
          >
            <option value="">All Models</option>
            {MODEL_OPTIONS.map((model) => (
              <option key={model} value={model}>
                {model}
              </option>
            ))}
          </select>
          <select
            value={filters.status}
            onChange={(event) => setFilters((prev) => ({ ...prev, status: event.target.value }))}
            className="bg-white border border-gray-200 rounded px-2 py-1.5 text-xs font-medium focus:ring-2 focus:ring-blue-500 outline-none shadow-sm"
          >
            <option value="">All Statuses</option>
            {DEAL_STATUSES.map((status) => (
              <option key={status} value={status}>
                {status}
              </option>
            ))}
          </select>
          <div className="h-4 w-px bg-gray-300 mx-1" />
          <button
            onClick={resetFilters}
            className="text-xs text-gray-500 hover:text-blue-600 font-medium px-2"
          >
            Clear Filters
          </button>
        </div>
      </header>

      <main className="flex-1 overflow-auto">
        <div className="max-w-6xl mx-auto py-6 px-6 space-y-6">
          {globalError && (
            <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded-lg flex justify-between items-start">
              <span>{globalError}</span>
              <button
                onClick={() => setGlobalError(null)}
                className="text-xs text-red-600 hover:underline"
              >
                Dismiss
              </button>
            </div>
          )}
          {infoMessage && (
            <div className="bg-emerald-50 border border-emerald-200 text-emerald-800 px-4 py-3 rounded-lg flex justify-between items-start">
              <span>{infoMessage}</span>
              <button
                onClick={() => setInfoMessage(null)}
                className="text-xs text-emerald-600 hover:underline"
              >
                Dismiss
              </button>
            </div>
          )}

          <section className="grid gap-6 lg:grid-cols-[2fr,1fr]">
            <div className="bg-white border border-gray-200 rounded-xl p-5 shadow-sm">
              <div className="flex items-center justify-between mb-4">
                <div>
                  <p className="text-xs uppercase font-semibold text-blue-500 tracking-wider">
                    AI Assistant
                  </p>
                  <h2 className="text-lg font-semibold text-gray-900">Turn raw notes into deals</h2>
                  <p className="text-xs text-gray-500">
                    Paste Slack/email updates and let AI sync them into the tracker.
                  </p>
                </div>
                <div className="bg-blue-50 text-blue-600 p-2 rounded-full">
                  <WandSparkles size={18} />
                </div>
              </div>
              <textarea
                value={aiInput}
                onChange={(event) => setAiInput(event.target.value)}
                placeholder="Example: 'Partner A ready for onboarding, need creatives by Friday...'"
                className="w-full h-32 border border-gray-200 rounded-lg p-3 text-xs font-mono focus:ring-2 focus:ring-blue-500 outline-none resize-none"
              />
              <div className="flex items-center justify-between mt-3">
                <div className="text-xs text-gray-500">
                  AI will match by partner name or create new rows automatically.
                </div>
                <button
                  onClick={handleAiIngest}
                  disabled={aiLoading}
                  className="flex items-center gap-2 bg-blue-600 hover:bg-blue-700 disabled:opacity-60 text-white px-4 py-2 rounded-md font-medium transition"
                >
                  <WandSparkles size={16} />
                  {aiLoading ? 'Processing...' : 'Process Updates'}
                </button>
              </div>
              {aiSummary && <p className="text-sm text-emerald-600 mt-3">{aiSummary}</p>}
              {aiError && <p className="text-sm text-red-600 mt-3">{aiError}</p>}
            </div>

            <div className="bg-white border border-gray-200 rounded-xl p-5 shadow-sm">
              <h2 className="text-lg font-semibold text-gray-900 mb-2">Quick tips</h2>
              <ul className="text-sm text-gray-600 space-y-2">
                <li>• Use filters to mirror geo-status breakdowns on leadership calls.</li>
                <li>• Import bulk partner lists with the JSON helper.</li>
                <li>• Export CSV snapshots before revenue reviews.</li>
              </ul>
            </div>
          </section>

          <section className="bg-white border border-gray-200 rounded-xl shadow-sm">
            <div className="min-w-[1000px] overflow-x-auto">
              <table className="w-full text-left border-collapse">
                <thead className="bg-gray-50 border-b border-gray-200 text-gray-500 font-semibold text-xs uppercase tracking-wider sticky top-0 z-10">
                  <tr>
                    <th className="p-0 border-r border-gray-100 w-10 text-center py-3">#</th>
                    <th className="p-0 border-r border-gray-100 w-48">
                      <div className="px-3 py-2">Partner Name</div>
                    </th>
                    <th className="p-0 border-r border-gray-100 w-24">
                      <div className="px-3 py-2">Geo</div>
                    </th>
                    <th className="p-0 border-r border-gray-100 w-32">
                      <div className="px-3 py-2">Source</div>
                    </th>
                    <th className="p-0 border-r border-gray-100 w-24">
                      <div className="px-3 py-2">Model</div>
                    </th>
                    <th className="p-0 border-r border-gray-100 w-32">
                      <div className="px-3 py-2">Status</div>
                    </th>
                    <th className="p-0 border-r border-gray-100 w-64">
                      <div className="px-3 py-2">Deal Details</div>
                    </th>
                    <th className="p-0 w-64">
                      <div className="px-3 py-2">Next Steps</div>
                    </th>
                    <th className="p-0 w-12" />
                  </tr>
                </thead>
                <tbody className="divide-y divide-gray-100">{renderTableBody()}</tbody>
              </table>
            </div>
          </section>
        </div>
      </main>

      {importModalOpen && (
        <div className="fixed inset-0 bg-black/60 z-50 flex items-center justify-center px-4">
          <div className="bg-white rounded-2xl shadow-2xl w-full max-w-lg p-6">
            <h2 className="text-lg font-bold mb-1">Import Data</h2>
            <p className="text-xs text-gray-500 mb-4">
              Paste an array of JSON deals. Example: [{'{'}"name":"Partner A","geo":"UK"{'}'}]
            </p>
            <textarea
              value={importText}
              onChange={(event) => setImportText(event.target.value)}
              className="w-full h-48 border border-gray-300 rounded-md p-3 text-xs font-mono mb-4 focus:ring-2 focus:ring-blue-500 outline-none"
              placeholder='[{"name": "Partner A", "geo": "UK"}]'
            />
            <div className="flex justify-end gap-2">
              <button
                onClick={() => setImportModalOpen(false)}
                className="px-4 py-2 text-gray-600 hover:bg-gray-100 rounded-md"
              >
                Cancel
              </button>
              <button
                onClick={handleRunImport}
                disabled={importing}
                className="px-4 py-2 bg-blue-600 hover:bg-blue-700 disabled:opacity-60 text-white rounded-md"
              >
                {importing ? 'Importing...' : 'Import Deals'}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

export default App;
