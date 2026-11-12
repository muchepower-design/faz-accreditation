// src/pages/CardView.jsx
import { useEffect, useRef, useState } from 'react';
import { useParams, useNavigate, Link } from 'react-router-dom';
import QRCode from 'react-qr-code';
import toast from 'react-hot-toast';
import html2canvas from 'html2canvas';
import { accreditationAPI } from '../api';
import { resolveAssetUrl, formatDate, formatDateTime } from '../utils';
import { FaArrowLeft, FaCheckCircle, FaDownload, FaPrint, FaEnvelope } from 'react-icons/fa';
import logoImage from '../assets/logo/faz logo.jpg';

const STATUS_META = {
  pending:   { label: 'Pending Review', cls: 'bg-yellow-100 text-yellow-800' },
  approved:  { label: 'Approved',       cls: 'bg-green-100 text-green-800' },
  rejected:  { label: 'Rejected',       cls: 'bg-red-100 text-red-800' },
  cancelled: { label: 'Cancelled',      cls: 'bg-gray-100 text-gray-800' },
};

export default function CardView() {
  const { id } = useParams();
  const navigate = useNavigate();
  const [acc, setAcc] = useState(null);
  const [loading, setLoading] = useState(true);
  const [downloading, setDownloading] = useState(false);
  const [resending, setResending] = useState(false);
  const cardRef = useRef(null);

  useEffect(() => {
    accreditationAPI.myAccreditation(id)
      .then((res) => setAcc(res.data))
      .catch(() => toast.error('Card not found'))
      .finally(() => setLoading(false));
  }, [id]);

  const print = () => {
    window.print();
  };

  const download = async () => {
    if (!cardRef.current) return;
    setDownloading(true);
    try {
      const canvas = await html2canvas(cardRef.current, {
        backgroundColor: '#ffffff',
        scale: 3,
        useCORS: true,
        logging: false,
      });

      canvas.toBlob((blob) => {
        if (!blob) {
          toast.error('Could not generate image');
          return;
        }
        const url = URL.createObjectURL(blob);
        const a = document.createElement('a');
        a.href = url;
        const safeName = (acc?.full_name || 'card').replace(/[^a-z0-9]+/gi, '-').toLowerCase();
        a.download = `faz-accreditation-${safeName}-${acc?.qr_token || id}.png`;
        document.body.appendChild(a);
        a.click();
        a.remove();
        setTimeout(() => URL.revokeObjectURL(url), 1500);
        toast.success('Card downloaded');
      }, 'image/png');
    } catch (err) {
      console.error('Download failed:', err);
      toast.error('Download failed — please try again');
    } finally {
      setDownloading(false);
    }
  };

  const resendEmail = async () => {
    if (resending) return;
    setResending(true);
    try {
      const res = await accreditationAPI.resendCard(id);
      const delivery = res?.data?.delivery || {};
      if (delivery.email_sent) {
        toast.success(`Card sent to ${res?.data?.email || 'your email'}`);
      } else {
        toast.error(delivery.email_error ? `Could not send: ${delivery.email_error}` : 'Could not send the email');
      }
    } catch (err) {
      toast.error(err?.response?.data?.error || 'Failed to resend card');
    } finally {
      setResending(false);
    }
  };

  if (loading) {
    return <div className="flex justify-center py-20">
      <div className="w-16 h-16 border-4 border-faz-green border-t-faz-orange rounded-full animate-spin" />
    </div>;
  }

  if (!acc) {
    return <div className="container mx-auto py-20 text-center">
      <p className="text-gray-500 mb-4">Card not found.</p>
      <Link to="/my" className="btn-primary">Back to My Cards</Link>
    </div>;
  }

  const meta = STATUS_META[acc.status] || STATUS_META.pending;
  const match = acc.match;
  const canActOnCard = acc.status === 'approved';

  return (
    <>
      <style>{`
        @media print {
          /* Force the browser to print background colors and images */
          * {
            -webkit-print-color-adjust: exact !important;
            print-color-adjust: exact !important;
          }

          /* Hide the entire body by default */
          body {
            visibility: hidden;
            background: white !important;
            margin: 0 !important;
            padding: 0 !important;
          }

          /* Make ONLY the card wrapper visible */
          #print-wrapper,
          #print-wrapper * {
            visibility: visible !important;
          }

          /* Pull the card to the top left of the page */
          #print-wrapper {
            position: absolute !important;
            left: 0 !important;
            top: 0 !important;
            width: 100% !important;
            margin: 0 !important;
            padding: 0 !important;
            display: flex !important;
            justify-content: center !important;
          }

          /* Strip shadows and max-width so it fits the page nicely */
          #card-print-area {
            box-shadow: none !important;
            border: 1px solid #e5e7eb !important;
            border-radius: 0 !important;
            width: 100% !important;
            max-width: 100% !important;
          }

          @page {
            size: A4 portrait;
            margin: 10mm;
          }
        }
      `}</style>

      <div className="container mx-auto px-4 py-8 max-w-2xl">
        <div className="flex justify-between items-center mb-4 flex-wrap gap-3">
          <button
            onClick={() => navigate('/my')}
            className="inline-flex items-center gap-2 text-sm text-gray-500 hover:text-faz-orange"
          >
            <FaArrowLeft /> Back to My Cards
          </button>

          {canActOnCard && (
            <div className="flex flex-wrap gap-2">
              <button
                onClick={resendEmail}
                disabled={resending}
                className="btn-outline py-2 text-sm disabled:opacity-50 inline-flex items-center gap-2"
                title={`Send a copy to ${acc?.applicant?.email || acc?.email || 'your email'}`}
              >
                <FaEnvelope />
                {resending ? 'Sending…' : 'Resend via Email'}
              </button>
              <button
                onClick={download}
                disabled={downloading}
                className="btn-outline py-2 text-sm disabled:opacity-50"
              >
                <FaDownload /> {downloading ? 'Downloading…' : 'Download'}
              </button>
              <button
                onClick={print}
                className="btn-primary py-2 text-sm"
              >
                <FaPrint /> Print
              </button>
            </div>
          )}
        </div>

        {/* 
          Wrapped in #print-wrapper so the CSS can target it.
          Note that we don't need print:hidden anywhere because 
          the CSS explicitly hides the body and shows only this.
        */}
        <div id="print-wrapper">
          <div id="card-print-area" ref={cardRef} className="w-full">
            <div className="rounded-2xl overflow-hidden shadow-2xl border border-gray-200 bg-white">
              {/* Header */}
              <div className="bg-gradient-to-r from-faz-green via-faz-black to-faz-orange text-white p-5">
                <div className="flex justify-between items-start">
                  <div>
                    <p className="text-[10px] uppercase tracking-widest text-faz-orange font-bold mb-1">
                      Football Association of Zambia
                    </p>
                    <h2 className="text-xl font-extrabold leading-tight">
                      Match Accreditation
                    </h2>
                    <p className="text-xs text-white/80 mt-1">{meta.label}</p>
                  </div>
                  <div className="w-14 h-14 bg-white rounded-lg p-1 flex items-center justify-center">
                    <img
                      src={logoImage}
                      alt="FAZ Logo"
                      className="h-10 w-auto object-contain rounded-md"
                      crossOrigin="anonymous"
                    />
                  </div>
                </div>
              </div>

              {/* Body */}
              <div className="p-5 grid grid-cols-3 gap-4">
                {/* Photo */}
                <div className="col-span-1">
                  {acc.passport_photo_url ? (
                    <img
                      src={resolveAssetUrl(acc.passport_photo_url)}
                      alt={acc.full_name}
                      className="w-full aspect-[3/4] object-cover rounded-lg border border-gray-200"
                      crossOrigin="anonymous"
                    />
                  ) : (
                    <div className="w-full aspect-[3/4] bg-gray-100 rounded-lg flex items-center justify-center text-4xl text-gray-300">
                      👤
                    </div>
                  )}
                </div>

                {/* Details */}
                <div className="col-span-2 space-y-1.5 text-sm">
                  <div>
                    <p className="text-[10px] uppercase tracking-wider text-gray-400">Name</p>
                    <p className="font-bold text-gray-800">{acc.full_name}</p>
                  </div>
                  <div>
                    <p className="text-[10px] uppercase tracking-wider text-gray-400">Category</p>
                    <p className="text-gray-800">
                      {acc.category_label}
                      {acc.service_provider_type_label ? ` — ${acc.service_provider_type_label}` : ''}
                    </p>
                  </div>
                  {acc.organization && (
                    <div>
                      <p className="text-[10px] uppercase tracking-wider text-gray-400">Organization</p>
                      <p className="text-gray-800">{acc.organization}</p>
                    </div>
                  )}
                  {acc.nationality_name && (
                    <div>
                      <p className="text-[10px] uppercase tracking-wider text-gray-400">Nationality</p>
                      <p className="text-gray-800">{acc.nationality_name}</p>
                    </div>
                  )}
                </div>
              </div>

              {/* Match details */}
              {match && (
                <div className="border-t border-gray-200 p-5 bg-gray-50">
                  <p className="text-[10px] uppercase tracking-wider text-gray-400 mb-1">Match</p>
                  <p className="font-bold text-gray-800">
                    {match.home_team} vs {match.away_team}
                  </p>
                  <div className="text-xs text-gray-600 mt-1">
                    {match.match_date && <span>{formatDate(match.match_date)}</span>}
                    {match.venue && <span> · {match.venue}</span>}
                    {match.competition && <span> · {match.competition}</span>}
                  </div>
                </div>
              )}

              {/* QR */}
              <div className="border-t border-gray-200 p-5 flex items-center justify-between gap-4 bg-white">
                <div className="flex-1 min-w-0">
                  <p className="text-[10px] uppercase tracking-wider text-gray-400 mb-1">Access Code</p>
                  <p className="font-mono text-lg font-bold text-faz-green break-all">{acc.qr_token}</p>
                  <p className="text-[10px] text-gray-500 mt-1">
                    Scan at the accreditation gate. One-time entry.
                  </p>
                  {acc.is_checked_in && (
                    <p className="text-[10px] text-green-700 mt-1 flex items-center gap-1">
                      <FaCheckCircle /> Checked in at {formatDateTime(acc.checked_in_at)}
                    </p>
                  )}
                </div>
                {acc.status === 'approved' ? (
                  <div className="bg-white p-2 rounded-lg border-2 border-gray-200">
                    <QRCode value={acc.qr_token} size={120} />
                  </div>
                ) : (
                  <div className="bg-gray-100 rounded-lg p-6 text-center text-xs text-gray-500">
                    QR available<br />after approval
                  </div>
                )}
              </div>

              {/* Footer bar */}
              <div className="bg-faz-black text-white text-[10px] px-5 py-2 flex justify-between items-center">
                <span>FAZ · Match Accreditation</span>
                <span className="font-mono">{acc.qr_token}</span>
              </div>
            </div>
          </div>
        </div>

        {/* Rejection / cancellation notices (hidden during print) */}
        {acc.status === 'rejected' && acc.rejection_reason && (
          <div className="mt-4 bg-red-50 border border-red-200 text-red-700 rounded-lg p-3 text-sm">
            <strong>Rejection reason:</strong> {acc.rejection_reason}
          </div>
        )}
        {acc.status === 'cancelled' && acc.cancellation_reason && (
          <div className="mt-4 bg-gray-100 border border-gray-200 text-gray-700 rounded-lg p-3 text-sm">
            <strong>Cancellation reason:</strong> {acc.cancellation_reason}
          </div>
        )}
        {acc.status === 'rejected' && (
          <div className="mt-4 text-center">
            <Link to={`/apply?edit=${acc.id}`} className="btn-primary">
              Fix &amp; Resubmit
            </Link>
          </div>
        )}
      </div>
    </>
  );
}