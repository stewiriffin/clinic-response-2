'use client'

import { signIn } from 'next-auth/react'

export default function SignInPage() {
  return (
    <div
      style={{
        minHeight: '100vh',
        background: 'linear-gradient(135deg, #6a11cb, #2575fc)',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        padding: '2rem',
        animation: 'fadeIn 1s ease-in-out',
      }}
    >
      <main
        style={{
          maxWidth: 400,
          width: '100%',
          backgroundColor: '#fff',
          padding: '2.5rem',
          borderRadius: 16,
          boxShadow: '0 10px 25px rgba(0,0,0,0.15)',
          fontFamily: "'Segoe UI', Roboto, sans-serif",
          textAlign: 'center',
          animation: 'slideUp 0.8s ease-out',
        }}
      >
        <h1
          style={{
            marginBottom: '0.5rem',
            fontSize: '1.8rem',
            color: '#333',
            animation: 'fadeIn 1.5s ease-in-out',
          }}
        >
          Welcome Back
        </h1>
        <p
          style={{
            marginBottom: '2rem',
            fontSize: '1rem',
            color: '#666',
            animation: 'fadeIn 2s ease-in-out',
          }}
        >
          Sign in to continue to your dashboard
        </p>

        <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
          <button
            onClick={() => signIn('github')}
            style={{ ...buttonStyle, background: '#24292f' }}
          >
            🐙 Sign in with GitHub
          </button>

          <button
            onClick={() => signIn('credentials')}
            style={{ ...buttonStyle, background: 'linear-gradient(135deg, #6a11cb, #2575fc)' }}
          >
            ✉️ Sign in with Email
          </button>
        </div>
      </main>

      {/* Animations */}
      <style jsx>{`
        @keyframes fadeIn {
          from { opacity: 0; }
          to { opacity: 1; }
        }
        @keyframes slideUp {
          from { opacity: 0; transform: translateY(30px); }
          to { opacity: 1; transform: translateY(0); }
        }
        button {
          transition: transform 0.2s ease, box-shadow 0.2s ease;
        }
        button:hover {
          transform: translateY(-2px) scale(1.02);
          box-shadow: 0 6px 15px rgba(0,0,0,0.3);
        }
        button:active {
          transform: scale(0.96);
        }
      `}</style>
    </div>
  )
}

const buttonStyle = {
  padding: '12px',
  border: 'none',
  borderRadius: 8,
  cursor: 'pointer',
  fontWeight: 'bold',
  fontSize: '1.05rem',
  color: 'white',
} as React.CSSProperties
