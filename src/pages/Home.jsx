import { Link } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { FaTicketAlt, FaShieldAlt, FaIdCard, FaArrowRight } from 'react-icons/fa';

export default function Home() {
  const { user } = useAuth();

  return (
    <div>
      {/* Hero */}
      <section className="relative bg-gradient-to-br from-faz-green via-faz-black to-faz-orange text-white overflow-hidden">
        <div className="container mx-auto px-4 py-20 text-center">
          <p className="text-xs uppercase tracking-widest text-faz-orange font-bold mb-3">Match Access</p>
          <h1 className="text-4xl md:text-6xl font-extrabold mb-4">
            FAZ Match <span className="text-faz-orange">Accreditation</span>
          </h1>
          <p className="text-lg text-white/90 max-w-2xl mx-auto mb-8">
            Apply for your per-match accreditation card — for media, FAZ staff,
            executive members, and service providers. Get instant digital access with a scannable QR code.
          </p>

          {user ? (
            <div className="flex flex-wrap gap-3 justify-center">
              <Link to="/apply" className="bg-white text-faz-green font-bold px-8 py-3 rounded-lg hover:bg-faz-orange hover:text-white transition shadow-lg">
                Apply for a Match
              </Link>
              <Link to="/my" className="bg-faz-orange text-white font-bold px-8 py-3 rounded-lg hover:bg-red-600 transition shadow-lg">
                My Cards
              </Link>
            </div>
          ) : (
            <div className="flex flex-wrap gap-3 justify-center">
              <Link to="/login" className="bg-white text-faz-green font-bold px-8 py-3 rounded-lg hover:bg-faz-orange hover:text-white transition shadow-lg">
                Sign In
              </Link>
              <Link to="/register" className="bg-faz-orange text-white font-bold px-8 py-3 rounded-lg hover:bg-red-600 transition shadow-lg">
                Create Account
              </Link>
            </div>
          )}
        </div>
      </section>

      {/* How it works */}
      <section className="container mx-auto px-4 py-16">
        <h2 className="text-2xl font-bold text-gray-800 text-center mb-2">How It Works</h2>
        <p className="text-sm text-gray-500 text-center mb-10">
          Four steps from application to gate access.
        </p>

        <div className="grid md:grid-cols-4 gap-6">
          {[
            { icon: FaIdCard, title: '1. Apply Online', desc: 'Fill in your details and choose your match. Attach a passport-size photo.' },
            { icon: FaShieldAlt, title: '2. Reviewed by Media', desc: 'FAZ Media & Communications reviews your application and approves it.' },
            { icon: FaTicketAlt, title: '3. Receive Your Card', desc: 'Your digital card appears in your portal with a unique QR code.' },
            { icon: FaArrowRight, title: '4. Present at Gate', desc: 'Show your QR code at the accreditation gate for scanning.' },
          ].map(({ icon: Icon, title, desc }) => (
            <div key={title} className="glass p-6 text-center">
              <div className="w-14 h-14 rounded-full bg-gradient-to-br from-faz-green to-faz-orange flex items-center justify-center mx-auto mb-4">
                <Icon className="text-white text-xl" />
              </div>
              <h3 className="font-semibold text-gray-800 mb-2">{title}</h3>
              <p className="text-sm text-gray-600">{desc}</p>
            </div>
          ))}
        </div>
      </section>

      {/* Categories */}
      <section className="bg-orange-50 py-16">
        <div className="container mx-auto px-4">
          <h2 className="text-2xl font-bold text-gray-800 text-center mb-2">Who Can Apply</h2>
          <p className="text-sm text-gray-500 text-center mb-10">
            Accreditation is granted per match, per category.
          </p>

          <div className="grid md:grid-cols-4 gap-4">
            {[
              { title: 'Media', desc: 'Journalists, photographers, broadcast crews' },
              { title: 'FAZ Secretariat', desc: 'FAZ administrative staff' },
              { title: 'FAZ Exco', desc: 'Executive committee members' },
              { title: 'Service Providers', desc: 'Medical, first aid, fire, ZESCO, security, police, ball boys/girls' },
            ].map((c) => (
              <div key={c.title} className="bg-white p-5 rounded-xl border border-gray-200">
                <h3 className="font-semibold text-gray-800 mb-1">{c.title}</h3>
                <p className="text-xs text-gray-500">{c.desc}</p>
              </div>
            ))}
          </div>
        </div>
      </section>
    </div>
  );
}