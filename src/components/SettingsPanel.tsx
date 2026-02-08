import React, { useState } from 'react';
import { Settings, Order, Enquiry } from '../types';

interface SettingsPanelProps {
    settings: Settings;
    orders: Order[];
    enquiries: Enquiry[];
    cardStyle: React.CSSProperties;
    btnPrimary: React.CSSProperties;
    btnSecondary?: React.CSSProperties; // Optional if not used
    onSave: (settings: Settings) => void;
    onRestoreData: (data: { orders?: Order[]; enquiries?: Enquiry[]; settings?: Settings }) => void;
}

export const SettingsPanel: React.FC<SettingsPanelProps> = ({ settings, orders, enquiries, cardStyle, btnPrimary, onSave, onRestoreData }) => {
    const [formData, setFormData] = useState(settings);
    const [newChargeHead, setNewChargeHead] = useState('');
    const [newArtistName, setNewArtistName] = useState('');
    const [newArtistPhone, setNewArtistPhone] = useState('');

    const addArtist = () => {
        if (newArtistName) {
            const newArtist = {
                id: Date.now().toString(),
                name: newArtistName,
                phone: newArtistPhone
            };
            setFormData({
                ...formData,
                makeupArtists: [...(formData.makeupArtists || []), newArtist]
            });
            setNewArtistName('');
            setNewArtistPhone('');
        }
    };

    const removeArtist = (id: string) => {
        setFormData({
            ...formData,
            makeupArtists: (formData.makeupArtists || []).filter(a => a.id !== id)
        });
    };

    const inputStyle: React.CSSProperties = {
        width: '100%',
        background: 'var(--bg-secondary)',
        border: '1px solid #444',
        padding: '12px',
        borderRadius: '8px',
        color: 'var(--text-primary)',
        fontSize: '16px',
        marginBottom: '16px',
    };

    const labelStyle: React.CSSProperties = {
        display: 'block',
        marginBottom: '8px',
        fontSize: '14px',
        color: 'var(--accent-color)',
        fontWeight: 'bold',
    };

    const handleSave = () => {
        onSave(formData);
        alert('Settings saved!');
    };

    const addChargeHead = () => {
        if (newChargeHead && !formData.customChargeHeads.includes(newChargeHead)) {
            setFormData({ ...formData, customChargeHeads: [...formData.customChargeHeads, newChargeHead] });
            setNewChargeHead('');
        }
    };

    const removeChargeHead = (head: string) => {
        setFormData({ ...formData, customChargeHeads: formData.customChargeHeads.filter(h => h !== head) });
    };

    const exportData = () => {
        const data = { orders, enquiries, settings, exportedAt: new Date().toISOString() };
        const blob = new Blob([JSON.stringify(data, null, 2)], { type: 'application/json' });
        const url = URL.createObjectURL(blob);
        const a = document.createElement('a');
        a.href = url;
        a.download = `eyas_backup_${new Date().toISOString().split('T')[0]}.json`;
        a.click();
        URL.revokeObjectURL(url);
    };

    const exportCSV = () => {
        const headers = ['Customer', 'Phone', 'Service', 'Location', 'Sarees', 'Event Date', 'Total', 'Paid', 'Balance', 'Status'];
        const rows = orders.map(o => [
            o.customerName, o.phone, o.serviceType, o.location, o.sareeCount,
            o.eventDate, o.totalAmount, o.amountPaid, o.totalAmount - o.amountPaid, o.status
        ]);
        const csv = [headers, ...rows].map(row => row.join(',')).join('\n');
        const blob = new Blob([csv], { type: 'text/csv' });
        const url = URL.createObjectURL(blob);
        const a = document.createElement('a');
        a.href = url;
        a.download = `eyas_orders_${new Date().toISOString().split('T')[0]}.csv`;
        a.click();
        URL.revokeObjectURL(url);
    };

    const importData = (event: React.ChangeEvent<HTMLInputElement>) => {
        const file = event.target.files?.[0];
        if (file) {
            const reader = new FileReader();
            reader.onload = (e) => {
                try {
                    const data = JSON.parse(e.target?.result as string);
                    if (confirm('This will replace all existing data. Continue?')) {
                        onRestoreData(data);
                        alert('Data restored successfully!');
                    }
                } catch {
                    alert('Invalid backup file');
                }
            };
            reader.readAsText(file);
        }
    };

    return (
        <div>
            <h2 style={{ fontSize: '24px', fontWeight: 'bold', marginBottom: '24px', color: 'var(--accent-color)' }}>⚙️ Settings</h2>

            {/* Business Info */}
            <div style={{ ...cardStyle, marginBottom: '16px' }}>
                <h3 style={{ fontSize: '16px', fontWeight: 'bold', marginBottom: '16px', color: 'var(--accent-color)' }}>🏢 Business Info</h3>

                <label style={labelStyle}>Business Name</label>
                <input
                    type="text"
                    value={formData.businessName}
                    onChange={(e) => setFormData({ ...formData, businessName: e.target.value })}
                    style={inputStyle}
                />

                <label style={labelStyle}>Phone</label>
                <input
                    type="tel"
                    value={formData.phone}
                    onChange={(e) => setFormData({ ...formData, phone: e.target.value })}
                    style={inputStyle}
                />

                <label style={labelStyle}>Address</label>
                <input
                    type="text"
                    value={formData.address}
                    onChange={(e) => setFormData({ ...formData, address: e.target.value })}
                    style={inputStyle}
                />

                <label style={labelStyle}>Instagram Handle</label>
                <input
                    type="text"
                    value={formData.instagram}
                    onChange={(e) => setFormData({ ...formData, instagram: e.target.value })}
                    style={inputStyle}
                />
            </div>

            {/* Pricing */}
            <div style={{ ...cardStyle, marginBottom: '16px' }}>
                <h3 style={{ fontSize: '16px', fontWeight: 'bold', marginBottom: '16px', color: 'var(--accent-color)' }}>💰 Default Pricing (Per Saree)</h3>

                <label style={labelStyle}>Pre-Pleat Rate</label>
                <input
                    type="number"
                    value={formData.prePleatRate}
                    onChange={(e) => setFormData({ ...formData, prePleatRate: parseInt(e.target.value) || 0 })}
                    style={inputStyle}
                />

                <label style={labelStyle}>Draping Rate</label>
                <input
                    type="number"
                    value={formData.drapeRate}
                    onChange={(e) => setFormData({ ...formData, drapeRate: parseInt(e.target.value) || 0 })}
                    style={inputStyle}
                />

                <label style={labelStyle}>Pre-Pleat + Draping Rate</label>
                <input
                    type="number"
                    value={formData.bothRate}
                    onChange={(e) => setFormData({ ...formData, bothRate: parseInt(e.target.value) || 0 })}
                    style={inputStyle}
                />
            </div>

            {/* Charge Heads */}
            <div style={{ ...cardStyle, marginBottom: '16px' }}>
                <h3 style={{ fontSize: '16px', fontWeight: 'bold', marginBottom: '16px', color: 'var(--accent-color)' }}>📋 Additional Charge Heads</h3>

                <div style={{ display: 'flex', flexWrap: 'wrap', gap: '8px', marginBottom: '16px' }}>
                    {formData.customChargeHeads.map(head => (
                        <span key={head} style={{
                            background: 'var(--bg-tertiary)',
                            padding: '8px 12px',
                            borderRadius: '20px',
                            display: 'flex',
                            alignItems: 'center',
                            gap: '8px',
                            fontSize: '14px',
                        }}>
                            {head}
                            <button onClick={() => removeChargeHead(head)} style={{ background: 'none', border: 'none', color: '#EF4444', cursor: 'pointer' }}>✕</button>
                        </span>
                    ))}
                </div>

                <div style={{ display: 'flex', gap: '8px' }}>
                    <input
                        type="text"
                        value={newChargeHead}
                        onChange={(e) => setNewChargeHead(e.target.value)}
                        placeholder="New charge head"
                        style={{ ...inputStyle, marginBottom: 0, flex: 1 }}
                    />
                    <button onClick={addChargeHead} style={{ ...btnPrimary, padding: '12px 20px' }}>Add</button>
                </div>
            </div>


            {/* Function Types */}
            <div style={{ ...cardStyle, marginBottom: '16px' }}>
                <h3 style={{ fontSize: '16px', fontWeight: 'bold', marginBottom: '16px', color: 'var(--accent-color)' }}>🎉 Function Types</h3>
                <div style={{ display: 'flex', flexWrap: 'wrap', gap: '8px', marginBottom: '16px' }}>
                    {(formData.functionTypes || []).map(type => (
                        <span key={type} style={{ background: 'var(--bg-tertiary)', padding: '8px 12px', borderRadius: '20px', display: 'flex', alignItems: 'center', gap: '8px', fontSize: '14px' }}>
                            {type}
                            <button onClick={() => setFormData({ ...formData, functionTypes: (formData.functionTypes || []).filter(t => t !== type) })} style={{ background: 'none', border: 'none', color: '#EF4444', cursor: 'pointer' }}>✕</button>
                        </span>
                    ))}
                </div>
                <div style={{ display: 'flex', gap: '8px' }}>
                    <input
                        type="text"
                        placeholder="New Function Type"
                        id="newFunctionType"
                        style={{ ...inputStyle, marginBottom: 0, flex: 1 }}
                        onKeyDown={(e) => {
                            if (e.key === 'Enter') {
                                const val = e.currentTarget.value.trim();
                                if (val && !(formData.functionTypes || []).includes(val)) {
                                    setFormData({ ...formData, functionTypes: [...(formData.functionTypes || []), val] });
                                    e.currentTarget.value = '';
                                }
                            }
                        }}
                    />
                    <button onClick={() => {
                        const input = document.getElementById('newFunctionType') as HTMLInputElement;
                        const val = input.value.trim();
                        if (val && !(formData.functionTypes || []).includes(val)) {
                            setFormData({ ...formData, functionTypes: [...(formData.functionTypes || []), val] });
                            input.value = '';
                        }
                    }} style={{ ...btnPrimary, padding: '12px 20px' }}>Add</button>
                </div>
            </div>

            {/* Pleat Types */}
            <div style={{ ...cardStyle, marginBottom: '16px' }}>
                <h3 style={{ fontSize: '16px', fontWeight: 'bold', marginBottom: '16px', color: 'var(--accent-color)' }}>👗 Pleat Types</h3>
                <div style={{ display: 'flex', flexWrap: 'wrap', gap: '8px', marginBottom: '16px' }}>
                    {(formData.pleatTypes || []).map(type => (
                        <span key={type} style={{ background: 'var(--bg-tertiary)', padding: '8px 12px', borderRadius: '20px', display: 'flex', alignItems: 'center', gap: '8px', fontSize: '14px' }}>
                            {type}
                            <button onClick={() => setFormData({ ...formData, pleatTypes: (formData.pleatTypes || []).filter(t => t !== type) })} style={{ background: 'none', border: 'none', color: '#EF4444', cursor: 'pointer' }}>✕</button>
                        </span>
                    ))}
                </div>
                <div style={{ display: 'flex', gap: '8px' }}>
                    <input
                        type="text"
                        placeholder="New Pleat Type"
                        id="newPleatType"
                        style={{ ...inputStyle, marginBottom: 0, flex: 1 }}
                        onKeyDown={(e) => {
                            if (e.key === 'Enter') {
                                const val = e.currentTarget.value.trim();
                                if (val && !(formData.pleatTypes || []).includes(val)) {
                                    setFormData({ ...formData, pleatTypes: [...(formData.pleatTypes || []), val] });
                                    e.currentTarget.value = '';
                                }
                            }
                        }}
                    />
                    <button onClick={() => {
                        const input = document.getElementById('newPleatType') as HTMLInputElement;
                        const val = input.value.trim();
                        if (val && !(formData.pleatTypes || []).includes(val)) {
                            setFormData({ ...formData, pleatTypes: [...(formData.pleatTypes || []), val] });
                            input.value = '';
                        }
                    }} style={{ ...btnPrimary, padding: '12px 20px' }}>Add</button>
                </div>
            </div>

            {/* Makeup Artists */}
            <div style={{ ...cardStyle, marginBottom: '16px' }}>
                <h3 style={{ fontSize: '16px', fontWeight: 'bold', marginBottom: '16px', color: 'var(--accent-color)' }}>💄 Makeup Artists</h3>
                <div style={{ display: 'flex', flexDirection: 'column', gap: '8px', marginBottom: '16px' }}>
                    {(formData.makeupArtists || []).map(artist => (
                        <div key={artist.id} style={{ background: 'var(--bg-tertiary)', padding: '8px 12px', borderRadius: '8px', display: 'flex', alignItems: 'center', justifyContent: 'space-between', fontSize: '14px', border: '1px solid var(--border)' }}>
                            <div>
                                <span style={{ fontWeight: 'bold' }}>{artist.name}</span>
                                <span style={{ color: 'var(--text-muted)', marginLeft: '8px' }}>{artist.phone}</span>
                            </div>
                            <button onClick={() => removeArtist(artist.id)} style={{ background: 'none', border: 'none', color: '#EF4444', cursor: 'pointer', padding: '4px' }}>✕</button>
                        </div>
                    ))}
                    {(formData.makeupArtists || []).length === 0 && <p style={{ color: 'var(--text-muted)', fontSize: '12px', textAlign: 'center' }}>No makeup artists added yet.</p>}
                </div>
                <div style={{ display: 'flex', gap: '8px' }}>
                    <input
                        type="text"
                        placeholder="Name"
                        value={newArtistName}
                        onChange={(e) => setNewArtistName(e.target.value)}
                        style={{ ...inputStyle, marginBottom: 0, flex: 1 }}
                    />
                    <input
                        type="tel"
                        placeholder="Phone"
                        value={newArtistPhone}
                        onChange={(e) => setNewArtistPhone(e.target.value)}
                        style={{ ...inputStyle, marginBottom: 0, flex: 1 }}
                    />
                    <button onClick={addArtist} style={{ ...btnPrimary, padding: '12px 20px' }}>Add</button>
                </div>
            </div>

            {/* Data Management */}
            <div style={{ ...cardStyle, marginBottom: '16px' }}>
                <h3 style={{ fontSize: '16px', fontWeight: 'bold', marginBottom: '16px', color: 'var(--accent-color)' }}>💾 Data Management</h3>

                <div style={{ display: 'grid', gap: '12px' }}>
                    <button onClick={exportData} style={{ ...btnPrimary, width: '100%' }}>
                        📥 Download Backup (JSON)
                    </button>
                    <button onClick={exportCSV} style={{ ...btnPrimary, width: '100%' }}>
                        📊 Export Orders (CSV)
                    </button>
                    <label style={{ width: '100%', cursor: 'pointer', textAlign: 'center', padding: '12px 24px', borderRadius: '8px', border: '2px solid var(--accent-color)', color: 'var(--accent-color)', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '8px' }}>
                        📤 Restore Backup
                        <input type="file" accept=".json" onChange={importData} style={{ display: 'none' }} />
                    </label>
                </div>
            </div>

            <button onClick={handleSave} style={{ ...btnPrimary, width: '100%', padding: '16px', fontSize: '18px' }}>
                💾 Save Settings
            </button>
        </div>
    );
};
