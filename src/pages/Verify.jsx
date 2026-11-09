import { useState } from 'react';
import { useAuth } from '../context/AuthContext';
import { accreditationAPI } from '../api';
import { resolveAssetUrl, formatDateTime } from '../utils';
import toast from 'react-hot-toast';
import { FaSearch, FaCheckCircle, FaTimesCircle } from 'react-icons/fa';

export default function Verify() {
  const { user } = useAuth();
  const [token, setToken] = useState('');
  const [busy, setBusy] = useState(false);
  const [result, setResult] = useState(null);
  const [error, setError] = useState('');
  const [checkingIn, setCheckingIn] = useState(false);

  const isReviewer = user && (
    user.roles?.includes('scanner') ||
    user.roles?.includes('media_officer') ||
    user.roles?.includes('admin') ||
    user.roles?.includes('super_admin') ||
    user.roles?.includes('faz_admin') ||
    user.roles?.includes('match_commissioner')
  );

  const lookup = async (e) => {
    if (e) e.preventDefault();
    if (!token.trim()) return;
    setBusy(true);
    setResult(null);
    setError('');
    try {
      const res = await accreditationAPI.verify(token.trim());
      setResult(res.data);
    } catch (err) {
      setError(err.response?.data?.error || 'Invalid or expired token');
    } finally {
      setBusy(false);
    }
  };

  const checkIn = async () => {
    setCheckingIn(true);
    try {
      const res = await accreditationAPI.checkIn(token.trim());
      toast.success(res.data.message);
      setResult(res.data.accreditation);
    } catch (err) {
      toast.error(err.response?.data?.error || 'Check-in failed');
    } finally {
      setCheckingIn(false);
    }
  };

  return (
    <div className="container mx-auto px-4 py-8 max-w-2xl">
      <div className="mb-6">
        <h1 className="text-3xl font-bold gradient-text">Verify Accreditation</h1>
        <p className="text-sm text-gray-500 mt-1">
          Scan the QR code with a USB scanner or type the access code below.
        </p>
      </div>

      {!user ? (
        <div className="glass p-8 text-center">
          <p className="text-gray-600 mb-4">You must be logged in to verify accreditation.</p>
          <a href="/login" className="btn-primary">Sign in</a>
        </div>
      ) : !isReviewer ? (
        <div className="glass p-8 text-center">
          <FaTimesCircle className="w-12 h-12 text-red-500 mx-auto mb-3" />
          <p className="text-gray-700">Your account does not have permission to verify accreditations.</p>
          <p className="text-xs text-gray-500 mt-1">Contact FAZ if you believe this is an error.</p>
        </div>
      ) : (
        <>
          <form onSubmit={lookup} className="glass p-5 flex gap-2 mb-4">
            <div className="relative flex-1">
              <FaSearch className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" />
              <input
                type="text"
                value={token}
                onChange={(e) => setToken(e.target.value)}
                placeholder="Enter 16-character access code…"
                className="w-full pl-10 pr-3 py-2.5 border border-gray-300 rounded-lg text-sm font-mono focus:outline-none focus:ring-2 focus:ring-faz-orange/30"
                autoFocus
              />
            </div>
            <button type="submit" disabled={busy || !token.trim()} className="btn-primary px-6">
              {busy ? '…' : 'Verify'}
            </button>
          </form>

          {error && (
            <div className="bg-red-50 border border-red-200 text-red-700 rounded-lg p-4 text-sm flex items-start gap-2 mb-4">
              <FaTimesCircle className="flex-shrink-0 mt-0.5" />
              <div>{error}</div>
            </div>
          )}

          {result && (
            <div className={`rounded-2xl border-2 p-5 ${result.status === 'approved' ? 'border-green-300 bg-green-50' : 'border-red-300 bg-red-50'}`}>
              <div className="flex items-center gap-3 mb-3">
                {result.status === 'approved'
                  ? <FaCheckCircle className="text-green-600 text-2xl" />
                  : <FaTimesCircle className="text-red-600 text-2xl" />}
                <div>
                  <p className="font-bold text-gray-800">
                    {result.status === 'approved' ? 'Valid Accreditation' : `Card is ${result.status}`}
                  </p>
                  <p className="text-xs text-gray-600">{result.category_label}</p>
                </div>
              </div>

              <div className="flex gap-4">
                {result.passport_photo_url && (
                  <img src={resolveAssetUrl(result.passport_photo_url)}
                       alt="" className="w-20 h-20 object-cover rounded-lg border border-white" />
                )}
                <div className="flex-1 text-sm">
                  <p className="font-semibold text-gray-800">{result.full_name}</p>
                  {result.organization && <p className="text-gray-600">{result.organization}</p>}
                  {result.match && (
                    <p className="text-gray-600 text-xs mt-1">
                      {result.match.home_team} vs {result.match.away_team}
                      {result.match.venue && ` @ ${result.match.venue}`}
                    </p>
                  )}
                </div>
              </div>

              {result.is_checked_in && (
                <div className="mt-3 pt-3 border-t border-green-200 text-xs text-green-700">
                  Already checked in at {formatDateTime(result.checked_in_at)}
                </div>
              )}

              {result.status === 'approved' && !result.is_checked_in && (
                <button onClick={checkIn} disabled={checkingIn} className="btn-primary w-full mt-4">
                  {checkingIn ? 'Checking in…' : 'Check In'}
                </button>
              )}
            </div>
          )}
        </>
      )}
    </div>
  );
}