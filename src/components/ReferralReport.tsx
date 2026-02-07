import React, { useMemo } from 'react';
import { Customer } from '../types';

interface ReferralStat {
    name: string;
    count: number;
    phone?: string;
    id?: string;
    type: 'makeup_artist' | 'customer';
}

export const ReferralReport: React.FC<{
    customers: Customer[];
    cardStyle: React.CSSProperties;
}> = ({ customers, cardStyle }) => {

    const stats = useMemo(() => {
        const makeupArtists: Record<string, ReferralStat> = {};
        const customerReferrers: Record<string, ReferralStat> = {};
        let instagramCount = 0;
        let otherCount = 0;

        customers.forEach(c => {
            if (c.referralSource === 'instagram') instagramCount++;
            else if (c.referralSource === 'other') otherCount++;
            else if (c.referralSource === 'makeup_artist' && c.makeupArtistDetails?.name) {
                const key = c.makeupArtistDetails.name.toLowerCase();
                if (!makeupArtists[key]) {
                    makeupArtists[key] = {
                        name: c.makeupArtistDetails.name,
                        phone: c.makeupArtistDetails.phone,
                        count: 0,
                        type: 'makeup_artist'
                    };
                }
                makeupArtists[key].count++;
            }
            else if (c.referralSource === 'customer' && c.referredByCustomerId) {
                // Find referring customer details
                const referrer = customers.find(ref => ref.id === c.referredByCustomerId);
                if (referrer) {
                    if (!customerReferrers[referrer.id]) {
                        customerReferrers[referrer.id] = {
                            name: referrer.name,
                            phone: referrer.phone,
                            id: referrer.id,
                            count: 0,
                            type: 'customer'
                        };
                    }
                    customerReferrers[referrer.id].count++;
                }
            }
        });

        return {
            makeupArtists: Object.values(makeupArtists).sort((a, b) => b.count - a.count),
            customerReferrers: Object.values(customerReferrers).sort((a, b) => b.count - a.count),
            instagramCount,
            otherCount
        };
    }, [customers]);

    return (
        <div className="animate-fadeIn">
            <h2 style={{
                fontSize: '24px',
                fontWeight: 'bold',
                background: 'var(--gold)',
                WebkitBackgroundClip: 'text',
                WebkitTextFillColor: 'transparent',
                marginBottom: '24px'
            }}>
                📢 Referral Insights
            </h2>

            {/* Summary Cards */}
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))', gap: '16px', marginBottom: '32px' }}>
                <div style={{ background: 'var(--bg-tertiary)', padding: '20px', borderRadius: '12px', textAlign: 'center' }}>
                    <div style={{ fontSize: '32px', marginBottom: '8px' }}>📱</div>
                    <div style={{ color: 'var(--text-secondary)', fontSize: '14px' }}>Instagram/Social</div>
                    <div style={{ fontSize: '24px', fontWeight: 'bold', color: '#E1306C' }}>{stats.instagramCount}</div>
                </div>
                <div style={{ background: 'var(--bg-tertiary)', padding: '20px', borderRadius: '12px', textAlign: 'center' }}>
                    <div style={{ fontSize: '32px', marginBottom: '8px' }}>💄</div>
                    <div style={{ color: 'var(--text-secondary)', fontSize: '14px' }}>Makeup Artists</div>
                    <div style={{ fontSize: '24px', fontWeight: 'bold', color: 'var(--purple)' }}>
                        {stats.makeupArtists.reduce((sum, m) => sum + m.count, 0)}
                    </div>
                </div>
                <div style={{ background: 'var(--bg-tertiary)', padding: '20px', borderRadius: '12px', textAlign: 'center' }}>
                    <div style={{ fontSize: '32px', marginBottom: '8px' }}>🫂</div>
                    <div style={{ color: 'var(--text-secondary)', fontSize: '14px' }}>Customer Referrals</div>
                    <div style={{ fontSize: '24px', fontWeight: 'bold', color: 'var(--color-success)' }}>
                        {stats.customerReferrers.reduce((sum, c) => sum + c.count, 0)}
                    </div>
                </div>
                <div style={{ background: 'var(--bg-tertiary)', padding: '20px', borderRadius: '12px', textAlign: 'center' }}>
                    <div style={{ fontSize: '32px', marginBottom: '8px' }}>⚪</div>
                    <div style={{ color: 'var(--text-secondary)', fontSize: '14px' }}>Walk-in/Other</div>
                    <div style={{ fontSize: '24px', fontWeight: 'bold', color: 'var(--text-muted)' }}>{stats.otherCount}</div>
                </div>
            </div>

            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '24px' }}>
                {/* Makeup Artist List */}
                <div className="glass-card" style={cardStyle}>
                    <h3 style={{ fontSize: '18px', fontWeight: 'bold', color: 'var(--purple)', marginBottom: '16px', borderBottom: '1px solid var(--border)', paddingBottom: '8px' }}>
                        Top Makeup Artists
                    </h3>
                    {stats.makeupArtists.length === 0 ? (
                        <p style={{ color: 'var(--text-muted)', textAlign: 'center', padding: '20px' }}>No MUA referrals yet.</p>
                    ) : (
                        <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
                            {stats.makeupArtists.map((mua, idx) => (
                                <div key={idx} style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', padding: '12px', background: 'rgba(255,255,255,0.03)', borderRadius: '8px' }}>
                                    <div>
                                        <div style={{ fontWeight: 'bold' }}>{mua.name}</div>
                                        {mua.phone && <div style={{ fontSize: '12px', color: 'var(--text-muted)' }}>📞 {mua.phone}</div>}
                                    </div>
                                    <div style={{ background: 'var(--purple)', padding: '4px 12px', borderRadius: '12px', fontWeight: 'bold', fontSize: '14px' }}>
                                        {mua.count}
                                    </div>
                                </div>
                            ))}
                        </div>
                    )}
                </div>

                {/* Customer Referrers List */}
                <div className="glass-card" style={cardStyle}>
                    <h3 style={{ fontSize: '18px', fontWeight: 'bold', color: 'var(--color-success)', marginBottom: '16px', borderBottom: '1px solid var(--border)', paddingBottom: '8px' }}>
                        Top Customer Referrers
                    </h3>
                    {stats.customerReferrers.length === 0 ? (
                        <p style={{ color: 'var(--text-muted)', textAlign: 'center', padding: '20px' }}>No customer referrals yet.</p>
                    ) : (
                        <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
                            {stats.customerReferrers.map((cust) => (
                                <div key={cust.id} style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', padding: '12px', background: 'rgba(255,255,255,0.03)', borderRadius: '8px' }}>
                                    <div>
                                        <div style={{ fontWeight: 'bold' }}>{cust.name}</div>
                                        <div style={{ fontSize: '12px', color: 'var(--text-muted)' }}>📞 {cust.phone}</div>
                                    </div>
                                    <div style={{ background: 'var(--color-success)', padding: '4px 12px', borderRadius: '12px', fontWeight: 'bold', fontSize: '14px' }}>
                                        {cust.count}
                                    </div>
                                </div>
                            ))}
                        </div>
                    )}
                </div>
            </div>
        </div>
    );
};
