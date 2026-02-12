import React, { useState } from 'react';
import { Customer } from '../types';
import { X, User, Phone, MapPin } from 'lucide-react';
import { generateId } from '../utils';

interface AddCustomerModalProps {
    onSave: (customer: Customer) => void;
    onClose: () => void;
}

export const AddCustomerModal: React.FC<AddCustomerModalProps> = ({ onSave, onClose }) => {
    const [name, setName] = useState('');
    const [phone, setPhone] = useState('');
    const [address, setAddress] = useState('');
    const [error, setError] = useState('');

    const handleSubmit = (e: React.FormEvent) => {
        e.preventDefault();

        if (!name.trim() || !phone.trim()) {
            setError('Name and Phone are required');
            return;
        }

        const newCustomer: Customer = {
            id: generateId(),
            name: name.trim(),
            phone: phone.trim(),
            permanentAddress: address.trim(),
            createdAt: new Date().toISOString()
        };

        onSave(newCustomer);
        onClose();
    };

    return (
        <div style={{
            position: 'fixed',
            top: 0,
            left: 0,
            right: 0,
            bottom: 0,
            background: 'var(--modal-backdrop)',
            backdropFilter: 'blur(5px)',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            zIndex: 1300,
            animation: 'fadeIn 0.2s ease-out'
        }}>
            <div style={{
                background: 'var(--glass-bg)',
                backdropFilter: 'blur(20px)',
                borderRadius: '24px',
                padding: '24px',
                width: '100%',
                maxWidth: '400px',
                border: '1px solid var(--glass-border)',
                boxShadow: 'var(--shadow-lg)',
                position: 'relative'
            }}>
                <button
                    onClick={onClose}
                    style={{
                        position: 'absolute',
                        top: '16px',
                        right: '16px',
                        background: 'transparent',
                        border: 'none',
                        color: 'var(--text-secondary)',
                        cursor: 'pointer'
                    }}
                >
                    <X size={20} />
                </button>

                <h2 style={{
                    fontSize: '20px',
                    fontWeight: 'bold',
                    marginBottom: '20px',
                    color: 'var(--text-primary)',
                    textAlign: 'center'
                }}>
                    Add New Customer
                </h2>

                <form onSubmit={handleSubmit} style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>

                    {error && (
                        <div style={{
                            background: 'rgba(220, 53, 69, 0.1)',
                            color: 'var(--error)',
                            padding: '10px',
                            borderRadius: '8px',
                            fontSize: '13px',
                            textAlign: 'center'
                        }}>
                            {error}
                        </div>
                    )}

                    <div style={{ display: 'flex', flexDirection: 'column', gap: '6px' }}>
                        <label style={{ fontSize: '12px', fontWeight: '600', color: 'var(--text-secondary)' }}>Full Name *</label>
                        <div style={{ position: 'relative' }}>
                            <User size={16} style={{ position: 'absolute', left: '12px', top: '12px', color: 'var(--text-muted)' }} />
                            <input
                                type="text"
                                value={name}
                                onChange={e => setName(e.target.value)}
                                placeholder="Enter customer name"
                                style={{ paddingLeft: '36px', background: 'var(--input-bg)', borderColor: 'var(--input-border)' }}
                                className="input-glow"
                                autoFocus
                            />
                        </div>
                    </div>

                    <div style={{ display: 'flex', flexDirection: 'column', gap: '6px' }}>
                        <label style={{ fontSize: '12px', fontWeight: '600', color: 'var(--text-secondary)' }}>Phone Number *</label>
                        <div style={{ position: 'relative' }}>
                            <Phone size={16} style={{ position: 'absolute', left: '12px', top: '12px', color: 'var(--text-muted)' }} />
                            <input
                                type="tel"
                                value={phone}
                                onChange={e => setPhone(e.target.value.replace(/\D/g, ''))}
                                placeholder="Enter phone number"
                                maxLength={10}
                                style={{ paddingLeft: '36px', background: 'var(--input-bg)', borderColor: 'var(--input-border)' }}
                                className="input-glow"
                            />
                        </div>
                    </div>

                    <div style={{ display: 'flex', flexDirection: 'column', gap: '6px' }}>
                        <label style={{ fontSize: '12px', fontWeight: '600', color: 'var(--text-secondary)' }}>Address (Optional)</label>
                        <div style={{ position: 'relative' }}>
                            <MapPin size={16} style={{ position: 'absolute', left: '12px', top: '12px', color: 'var(--text-muted)' }} />
                            <textarea
                                value={address}
                                onChange={e => setAddress(e.target.value)}
                                placeholder="Enter address"
                                rows={3}
                                style={{ paddingLeft: '36px', paddingTop: '10px', resize: 'none', background: 'var(--input-bg)', borderColor: 'var(--input-border)' }}
                                className="input-glow"
                            />
                        </div>
                    </div>

                    <button
                        type="submit"
                        style={{
                            marginTop: '8px',
                            background: 'var(--gold)',
                            color: 'var(--text-inverse)',
                            border: 'none',
                            padding: '12px',
                            borderRadius: 'var(--radius)',
                            fontWeight: 'bold',
                            fontSize: '14px',
                            cursor: 'pointer',
                            transition: 'transform 0.1s'
                        }}
                        onMouseDown={e => e.currentTarget.style.transform = 'scale(0.98)'}
                        onMouseUp={e => e.currentTarget.style.transform = 'scale(1)'}
                    >
                        Create Customer
                    </button>
                </form>
            </div>
        </div>
    );
};
