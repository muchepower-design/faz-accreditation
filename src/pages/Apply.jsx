import { useEffect, useState } from 'react';
import { useNavigate, useSearchParams } from 'react-router-dom';
import toast from 'react-hot-toast';
import { accreditationAPI } from '../api';
import { resolveAssetUrl } from '../utils';
import { FaUpload, FaTimes } from 'react-icons/fa';

export default function Apply() {
  const navigate = useNavigate();
  const [params] = useSearchParams();
  const editingId = params.get('edit'); // when re-editing a rejected card

  const [types, setTypes] = useState({ categories: [], service_provider_types: [] });
  const [countries, setCountries] = useState([]);
  const [matches, setMatches] = useState([]);
  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);
  const [photoUploading, setPhotoUploading] = useState(false);

  const [form, setForm] = useState({
    match_id: '',
    category: '',
    service_provider_type: '',
    full_name: '',
    nationality_country_id: '',
    phone: '',
    email: '',
    id_number: '',
    organization: '',
    position_title: '',
    passport_photo_url: '',
  });

  // Load dropdown data
  useEffect(() => {
    Promise.all([
      accreditationAPI.getTypes(),
      accreditationAPI.getCountries(),
      accreditationAPI.getMatches(),
    ]).then(([t, c, m]) => {
      setTypes(t.data);
      setCountries(c.data || []);
      setMatches(m.data || []);
    }).catch(() => toast.error('Failed to load form data'))
      .finally(() => setLoading(false));
  }, []);

  // Load existing card when editing
  useEffect(() => {
    if (!editingId) return;
    accreditationAPI.myAccreditation(editingId)
      .then((res) => {
        const a = res.data;
        if (!['pending', 'rejected'].includes(a.status)) {
          toast.error('This card cannot be edited');
          navigate('/my');
          return;
        }
        setForm({
          match_id: a.match_id,
          category: a.category,
          service_provider_type: a.service_provider_type || '',
          full_name: a.full_name,
          nationality_country_id: a.nationality_country_id || '',
          phone: a.phone || '',
          email: a.email || '',
          id_number: a.id_number || '',
          organization: a.organization || '',
          position_title: a.position_title || '',
          passport_photo_url: a.passport_photo_url || '',
        });
      })
      .catch(() => toast.error('Failed to load application'));
  }, [editingId, navigate]);

  const isServiceProvider = form.category === 'service_provider';

  const handlePhoto = async (file) => {
    if (!file) return;
    setPhotoUploading(true);
    try {
      const fd = new FormData();
      fd.append('file', file);
      const res = await accreditationAPI.uploadPhoto(fd);
      setForm((f) => ({ ...f, passport_photo_url: res.data.url }));
      toast.success('Photo uploaded');
    } catch (err) {
      toast.error(err.response?.data?.error || 'Upload failed');
    } finally {
      setPhotoUploading(false);
    }
  };

  const submit = async (e) => {
    e.preventDefault();

    if (!form.match_id) return toast.error('Choose a match');
    if (!form.category) return toast.error('Choose a category');
    if (isServiceProvider && !form.service_provider_type) {
      return toast.error('Choose a service provider type');
    }
    if (!form.passport_photo_url) {
      return toast.error('Please upload a passport-size photo');
    }

    setSubmitting(true);
    try {
      if (editingId) {
        await accreditationAPI.updateMy(editingId, form);
        toast.success('Application updated');
      } else {
        await accreditationAPI.apply(form);
        toast.success('Application submitted for review');
      }
      navigate('/my');
    } catch (err) {
      toast.error(err.response?.data?.error || 'Submission failed');
    } finally {
      setSubmitting(false);
    }
  };

  if (loading) {
    return <div className="flex justify-center py-20">
      <div className="w-16 h-16 border-4 border-faz-green border-t-faz-orange rounded-full animate-spin" />
    </div>;
  }

  return (
    <div className="container mx-auto px-4 py-8 max-w-3xl">
      <div className="mb-6">
        <h1 className="text-3xl font-bold gradient-text">{editingId ? 'Update Application' : 'Apply for Match Accreditation'}</h1>
        <p className="text-sm text-gray-500 mt-1">
          Choose the match, your category, and provide your details. FAZ Media
          will review your application.
        </p>
      </div>

      <form onSubmit={submit} className="glass p-6 space-y-5">
        {/* Match + Category */}
        <div className="grid md:grid-cols-2 gap-4">
          <div>
            <label className="block text-sm font-medium mb-1">Match <span className="text-red-500">*</span></label>
            <select value={form.match_id}
              onChange={(e) => setForm({ ...form, match_id: e.target.value })}
              className="input-field" required>
              <option value="">— Choose a match —</option>
              {matches.map((m) => (
                <option key={m.id} value={m.id}>
                  {m.home_team} vs {m.away_team}
                  {m.match_date ? ` — ${new Date(m.match_date).toLocaleDateString()}` : ''}
                  {m.venue ? ` @ ${m.venue}` : ''}
                </option>
              ))}
            </select>
          </div>

          <div>
            <label className="block text-sm font-medium mb-1">Category <span className="text-red-500">*</span></label>
            <select value={form.category}
              onChange={(e) => setForm({ ...form, category: e.target.value, service_provider_type: '' })}
              className="input-field" required>
              <option value="">— Choose a category —</option>
              {types.categories.map((c) => (
                <option key={c.value} value={c.value}>{c.label}</option>
              ))}
            </select>
          </div>
        </div>

        {/* Service-provider subtype */}
        {isServiceProvider && (
          <div>
            <label className="block text-sm font-medium mb-1">Service Provider Type <span className="text-red-500">*</span></label>
            <select value={form.service_provider_type}
              onChange={(e) => setForm({ ...form, service_provider_type: e.target.value })}
              className="input-field" required>
              <option value="">— Choose type —</option>
              {types.service_provider_types.map((t) => (
                <option key={t.value} value={t.value}>{t.label}</option>
              ))}
            </select>
          </div>
        )}

        {/* Applicant details */}
        <div className="border-t pt-5">
          <h3 className="font-semibold text-gray-800 mb-3">Your Details</h3>
          <div className="grid md:grid-cols-2 gap-4">
            <div className="md:col-span-2">
              <label className="block text-sm font-medium mb-1">Full Name <span className="text-red-500">*</span></label>
              <input value={form.full_name}
                onChange={(e) => setForm({ ...form, full_name: e.target.value })}
                className="input-field" required />
            </div>

            <div>
              <label className="block text-sm font-medium mb-1">Nationality</label>
              <select value={form.nationality_country_id}
                onChange={(e) => setForm({ ...form, nationality_country_id: e.target.value })}
                className="input-field">
                <option value="">— Select country —</option>
                {countries.map((c) => (
                  <option key={c.id} value={c.id}>{c.name}</option>
                ))}
              </select>
            </div>

            <div>
              <label className="block text-sm font-medium mb-1">ID / NRC / Passport No.</label>
              <input value={form.id_number}
                onChange={(e) => setForm({ ...form, id_number: e.target.value })}
                className="input-field" placeholder="e.g. 123456/10/1" />
            </div>

            <div>
              <label className="block text-sm font-medium mb-1">Phone</label>
              <input value={form.phone}
                onChange={(e) => setForm({ ...form, phone: e.target.value })}
                className="input-field" placeholder="+260…" />
            </div>

            <div>
              <label className="block text-sm font-medium mb-1">Email</label>
              <input type="email" value={form.email}
                onChange={(e) => setForm({ ...form, email: e.target.value })}
                className="input-field" />
            </div>

            <div>
              <label className="block text-sm font-medium mb-1">Organization / Media House</label>
              <input value={form.organization}
                onChange={(e) => setForm({ ...form, organization: e.target.value })}
                className="input-field" placeholder="e.g. ZNBC, Times of Zambia" />
            </div>

            <div>
              <label className="block text-sm font-medium mb-1">Position / Title</label>
              <input value={form.position_title}
                onChange={(e) => setForm({ ...form, position_title: e.target.value })}
                className="input-field" placeholder="e.g. Journalist, Photographer" />
            </div>
          </div>
        </div>

        {/* Photo */}
        <div className="border-t pt-5">
          <h3 className="font-semibold text-gray-800 mb-3">Passport-Size Photo <span className="text-red-500">*</span></h3>
          {form.passport_photo_url ? (
            <div className="flex items-center gap-3">
              <img src={resolveAssetUrl(form.passport_photo_url)}
                   alt=""
                   className="w-24 h-24 object-cover rounded-lg border border-gray-200" />
              <div className="flex flex-col gap-1">
                <label className="text-sm text-faz-orange cursor-pointer hover:underline">
                  Change photo
                  <input type="file" accept="image/*" className="hidden"
                    onChange={(e) => handlePhoto(e.target.files?.[0])} />
                </label>
                <button type="button" onClick={() => setForm({ ...form, passport_photo_url: '' })}
                        className="text-xs text-red-600 hover:underline text-left">
                  Remove
                </button>
              </div>
            </div>
          ) : (
            <label className="border-2 border-dashed border-gray-300 hover:border-faz-orange rounded-lg p-6 text-center cursor-pointer block">
              <FaUpload className="w-6 h-6 mx-auto text-gray-400 mb-1" />
              <p className="text-sm text-gray-600">{photoUploading ? 'Uploading…' : 'Click to upload passport photo'}</p>
              <p className="text-xs text-gray-400 mt-1">PNG, JPG — clear face, plain background</p>
              <input type="file" accept="image/*" className="hidden"
                onChange={(e) => handlePhoto(e.target.files?.[0])} />
            </label>
          )}
        </div>

        {/* Submit */}
        <div className="flex gap-3 border-t pt-5">
          <button type="submit" disabled={submitting} className="btn-primary flex-1">
            {submitting ? 'Submitting…' : (editingId ? 'Update & Resubmit' : 'Submit Application')}
          </button>
          <button type="button" onClick={() => navigate('/my')} className="btn-outline">Cancel</button>
        </div>
      </form>
    </div>
  );
}