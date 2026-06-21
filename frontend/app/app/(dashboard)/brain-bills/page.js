'use client';
import React, { useState, useEffect } from 'react';
import { useUser } from '@clerk/nextjs';
import { CreditCard, Receipt, Clock, Zap } from 'lucide-react';

export default function Page() {
  const { user } = useUser();
  const [billingData, setBillingData] = useState({ total_tokens_used: 0, estimated_cost_usd: 0, transactions: [] });
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (user) {
      fetchBillingData();
    }
  }, [user]);

  const fetchBillingData = async () => {
    try {
      const res = await fetch(`http://localhost:8000/api/v1/billing/${user.id}`);
      if (res.ok) {
        const data = await res.json();
        setBillingData(data);
      }
    } catch (err) {
      console.error('Failed to fetch billing data', err);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div style={{ padding: '2rem', maxWidth: '1200px', margin: '0 auto' }}>
      <h1 style={{ fontSize: '2rem', fontWeight: 'bold', marginBottom: '2rem', display: 'flex', alignItems: 'center', gap: '0.5rem', color: 'var(--text-primary)' }}>
        <Receipt size={32} color="var(--primary-color)" /> Brain Bills
      </h1>
      
      {loading ? (
        <p style={{ color: 'var(--text-secondary)' }}>Loading bills...</p>
      ) : (
        <>
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(300px, 1fr))', gap: '1.5rem', marginBottom: '3rem' }}>
            <div className="card" style={{ padding: '1.5rem', display: 'flex', alignItems: 'center', gap: '1rem' }}>
              <div style={{ padding: '1rem', background: 'rgba(59, 130, 246, 0.1)', borderRadius: '12px' }}>
                <Zap size={24} color="#3b82f6" />
              </div>
              <div>
                <p style={{ color: 'var(--text-secondary)', fontSize: '0.9rem', marginBottom: '0.25rem' }}>Total Tokens Used</p>
                <h2 style={{ fontSize: '1.8rem', fontWeight: 'bold', color: 'var(--text-primary)' }}>
                  {billingData.total_tokens_used.toLocaleString()}
                </h2>
              </div>
            </div>

            <div className="card" style={{ padding: '1.5rem', display: 'flex', alignItems: 'center', gap: '1rem' }}>
              <div style={{ padding: '1rem', background: 'rgba(16, 185, 129, 0.1)', borderRadius: '12px' }}>
                <CreditCard size={24} color="#10b981" />
              </div>
              <div>
                <p style={{ color: 'var(--text-secondary)', fontSize: '0.9rem', marginBottom: '0.25rem' }}>Estimated Cost</p>
                <h2 style={{ fontSize: '1.8rem', fontWeight: 'bold', color: 'var(--text-primary)' }}>
                  ${billingData.estimated_cost_usd.toFixed(6)}
                </h2>
              </div>
            </div>
          </div>

          <h2 style={{ fontSize: '1.5rem', fontWeight: '600', marginBottom: '1rem', color: 'var(--text-primary)' }}>Transaction History</h2>
          <div className="card" style={{ overflow: 'hidden' }}>
            <table style={{ width: '100%', borderCollapse: 'collapse' }}>
              <thead>
                <tr style={{ background: 'var(--bg-secondary)', borderBottom: '1px solid var(--border-color)', textAlign: 'left' }}>
                  <th style={{ padding: '1rem', color: 'var(--text-secondary)', fontWeight: '500' }}>Date</th>
                  <th style={{ padding: '1rem', color: 'var(--text-secondary)', fontWeight: '500' }}>Status</th>
                  <th style={{ padding: '1rem', color: 'var(--text-secondary)', fontWeight: '500', textAlign: 'right' }}>Tokens Used</th>
                </tr>
              </thead>
              <tbody>
                {billingData.transactions.length === 0 ? (
                  <tr>
                    <td colSpan="3" style={{ padding: '2rem', textAlign: 'center', color: 'var(--text-secondary)' }}>No transactions yet.</td>
                  </tr>
                ) : (
                  billingData.transactions.map(tx => (
                    <tr key={tx.id} style={{ borderBottom: '1px solid var(--border-color)' }}>
                      <td style={{ padding: '1rem', color: 'var(--text-primary)' }}>
                        <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                          <Clock size={16} color="var(--text-secondary)" />
                          {new Date(tx.created_at).toLocaleString()}
                        </div>
                      </td>
                      <td style={{ padding: '1rem' }}>
                        <span style={{ 
                          padding: '0.25rem 0.75rem', 
                          borderRadius: '9999px', 
                          fontSize: '0.85rem', 
                          fontWeight: '500',
                          background: tx.status === 'pending_billing' ? 'rgba(245, 158, 11, 0.1)' : 'rgba(59, 130, 246, 0.1)',
                          color: tx.status === 'pending_billing' ? '#f59e0b' : '#3b82f6'
                        }}>
                          {tx.status}
                        </span>
                      </td>
                      <td style={{ padding: '1rem', textAlign: 'right', fontWeight: '600', color: 'var(--text-primary)' }}>
                        {tx.tokens_used.toLocaleString()}
                      </td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          </div>
        </>
      )}
    </div>
  );
}
