import { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import toast from 'react-hot-toast';
import { accreditationAPI } from '../api';
import { resolveAssetUrl, formatDate } from '../utils';
import { FaIdCard, FaPlus, FaEye, FaEdit, FaTrash, FaQrcode } from 'react-icons/fa';

const STATUS_META = {
  pending:   { label: 'Pending Review', cls: 'bg-yellow-100 text-yellow-800 border-yellow-200' },
  approved:  { label: 'Approved',       cls: 'bg-green-100 text-green-800 border-green-200' },
  rejected:  { label: 'Rejected',       cls: 'bg-red-100 text-red-800 border-red-200' },
  cancelled: { label: 'Cancelled',      cls: 'bg-gray-100 text-gray-800 border-gray-200' },
};

export default function MyAccreditations() {
  const [items, setItems] = useState([]);
  const [loading, setLoading] = useState(true);

  const load = () => {
    setLoading(true);
    accreditationAPI.myAccreditations()
      .then((res) => setItems(res.data || []))
      .catch(() => toast.error('Failed to load cards'))
      .finally(() => setLoading(false));
  };

  useEffect(load, []);

  const withdraw = async (id) => {
    if (!confirm('Withdraw this application?')) return;
    try {
      await accreditationAPI.withdrawMy(id);
      toast.success('Application withdrawn');
      load();
    } catch (err) {
      toast.error(err.response?.data?.error || 'Failed');
    }
  };

  if (loading) {
    return <div className="flex justify-center py-20">
      <div className="w-16 h-16 border-4 border-faz-green border-t-faz-orange rounded-full animate-spin" />
    </div>;
  }

  return (
    <div className="container mx-auto px-4 py-8 max-w-5xl">
      <div className="flex justify-between items-center mb-6 flex-wrap gap-3">
        <div>
          <h1 className="text-3xl font-bold gradient-text">My Accreditation Cards</h1>
          <p className="text-sm text-gray-500 mt-1">
            Every card you've applied for. Click to view your QR code.
          </p>
        </div>
        <Link to="/apply" className="btn-primary">
          <FaPlus /> Apply for Match
        </Link>
      </div>

      {items.length === 0 ? (
        <div className="glass text-center py-16">
          <FaIdCard className="w-12 h-12 text-gray-300 mx-auto mb-3" />
          <h3 className="text-lg font-semibold text-gray-800">No cards yet</h3>
          <p className="text-sm text-gray-500 mb-4">Apply for your first match accreditation.</p>
          <Link to="/apply" className="btn-primary">Apply Now</Link>
        </div>
      ) : (
        <div className="grid md:grid-cols-2 gap-4">
          {items.map((a) => {
            const meta = STATUS_META[a.status] || STATUS_META.pending;
            const canEdit = a.status === 'pending' || a.status === 'rejected';
            return (
              <div key={a.id} className="bg-white rounded-2xl border border-gray-200 overflow-hidden shadow-sm hover:shadow-md transition">
                <div className="flex gap-4 p-4">
                  {a.passport_photo_url ? (
                    <img src={resolveAssetUrl(a.passport_photo_url)}
                         alt="" className="w-20 h-20 rounded-xl object-cover border border-gray-200 flex-shrink-0" />
                  ) : (
                    <div className="w-20 h-20 rounded-xl bg-gray-100 flex items-center justify-center text-3xl text-gray-300 flex-shrink-0">
                      👤
                    </div>
                  )}
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-2 mb-1">
                      <span className={`text-[10px] px-2 py-0.5 rounded-full border font-semibold ${meta.cls}`}>
                        {meta.label}
                      </span>
                    </div>
                    <h3 className="font-semibold text-gray-800 truncate">{a.full_name}</h3>
                    <p className="text-xs text-gray-500">
                      {a.category_label}{a.service_provider_type_label ? ` · ${a.service_provider_type_label}` : ''}
                    </p>
                    {a.match && (
                      <p className="text-xs text-gray-600 mt-1 truncate">
                        {a.match.home_team} vs {a.match.away_team}
                      </p>
                    )}
                    {a.match?.match_date && (
                      <p className="text-[11px] text-gray-400">{formatDate(a.match.match_date)}</p>
                    )}
                  </div>
                </div>

                {a.rejection_reason && a.status === 'rejected' && (
                  <div className="px-4 pb-2">
                    <p className="text-xs text-red-600">Reason: {a.rejection_reason}</p>
                  </div>
                )}

                <div className="flex gap-2 px-4 pb-4 border-t pt-3">
                  {a.status === 'approved' && (
                    <Link to={`/my/${a.id}`} className="flex-1 btn-primary py-2 text-sm justify-center">
                      <FaQrcode /> View Card
                    </Link>
                  )}
                  {a.status === 'pending' && (
                    <Link to={`/my/${a.id}`} className="flex-1 btn-outline py-2 text-sm justify-center">
                      <FaEye /> Preview
                    </Link>
                  )}
                  {canEdit && (
                    <>
                      <Link to={`/apply?edit=${a.id}`} className="btn-outline py-2 px-3 text-sm">
                        <FaEdit />
                      </Link>
                      <button onClick={() => withdraw(a.id)} className="btn-outline py-2 px-3 text-sm text-red-600 border-red-200 hover:border-red-400 hover:text-red-700">
                        <FaTrash />
                      </button>
                    </>
                  )}
                </div>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
}