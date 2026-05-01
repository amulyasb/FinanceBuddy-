import { useRef } from 'react'
import { formatCurrency, formatDate, calcSummary } from '../lib/utils'
import { X, Download } from 'lucide-react'
import jsPDF from 'jspdf'
import html2canvas from 'html2canvas'

export default function PrintStatement({ statement, onClose }) {
    const printRef = useRef()
    const { transactions = [], account, user } = statement
    const summary = calcSummary(transactions)

    const handlePDF = async () => {
        const element = printRef.current
        const canvas = await html2canvas(element, {
            scale: 2,
            useCORS: true,
            backgroundColor: '#ffffff',
            scrollX: 0,
            scrollY: -window.scrollY,
        })
        const imgData = canvas.toDataURL('image/png')
        const pdf = new jsPDF({ orientation: 'portrait', unit: 'mm', format: 'a4' })
        const pageWidth = pdf.internal.pageSize.getWidth()
        const pageHeight = pdf.internal.pageSize.getHeight()
        const margin = 6
        const imgWidth = pageWidth - margin * 2
        const imgHeight = (canvas.height * imgWidth) / canvas.width

        let heightLeft = imgHeight
        let position = margin

        pdf.addImage(imgData, 'PNG', margin, position, imgWidth, imgHeight)
        heightLeft -= pageHeight

        while (heightLeft > 0) {
            position = heightLeft - imgHeight + margin
            pdf.addPage()
            pdf.addImage(imgData, 'PNG', margin, position, imgWidth, imgHeight)
            heightLeft -= pageHeight
        }
        pdf.save(`${statement.statement_number}.pdf`)
    }

    return (
        <div className="modal-overlay" style={{ 
            alignItems: 'flex-start', 
            padding: 'clamp(12px, 3vw, 20px) clamp(8px, 2vw, 16px)', 
            overflow: 'auto' 
        }}>
            <div style={{ width: '100%', maxWidth: 760, margin: '0 auto' }}>
                {/* Action bar */}
                <div className="no-print" style={{
                    display: 'flex', 
                    justifyContent: 'space-between', 
                    alignItems: 'center',
                    marginBottom: 'clamp(12px, 3vw, 16px)', 
                    padding: 'clamp(10px, 2.5vw, 12px) clamp(12px, 3vw, 16px)',
                    background: 'rgba(17,24,39,0.9)', 
                    borderRadius: 'clamp(10px, 2vw, 12px)',
                    border: '1px solid rgba(30,41,59,0.6)',
                    gap: '10px',
                    flexWrap: 'wrap',
                }}>
                    <div style={{ 
                        fontWeight: 600, 
                        color: '#f1f5f9', 
                        fontSize: 'clamp(0.8rem, 2vw, 0.9rem)',
                        wordBreak: 'break-word',
                        minWidth: 0,
                        flex: '1 1 auto',
                    }}>
                        {statement.statement_number}
                    </div>
                    <div className="action-buttons" style={{ 
                        display: 'flex', 
                        gap: '8px',
                        flexWrap: 'wrap',
                    }}>
                        <button 
                            className="btn-primary" 
                            onClick={handlePDF} 
                            style={{ 
                                fontSize: 'clamp(0.75rem, 1.8vw, 0.8rem)', 
                                padding: 'clamp(6px, 1.5vw, 8px) clamp(10px, 2.5vw, 14px)',
                                display: 'flex',
                                alignItems: 'center',
                                gap: '6px',
                                background: 'linear-gradient(135deg, #1e40af, #3b82f6)',
                                border: 'none',
                                borderRadius: '8px',
                                color: '#fff',
                                fontWeight: 600,
                                cursor: 'pointer',
                                boxShadow: '0 2px 8px rgba(59,130,246,0.3)',
                                transition: 'opacity 0.15s',
                                whiteSpace: 'nowrap',
                            }}
                        >
                            <Download size={14} />
                            <span className="btn-label">PDF</span>
                            <span className="btn-label-full" style={{ display: 'none' }}>Download PDF</span>
                        </button>
                        <button 
                            onClick={onClose} 
                            style={{ 
                                background: '#334155', 
                                border: '1px solid #475569', 
                                borderRadius: '8px',
                                cursor: 'pointer', 
                                color: '#cbd5e1',
                                padding: '6px 8px',
                                display: 'flex',
                                alignItems: 'center',
                                justifyContent: 'center',
                                transition: 'background 0.15s',
                            }}
                        >
                            <X size={18} />
                        </button>
                    </div>
                </div>

                {/* Printable area */}
                <div ref={printRef} style={{
                    background: '#ffffff',
                    color: '#1a1a2e',
                    padding: 'clamp(20px, 5vw, 40px)',
                    borderRadius: 'clamp(10px, 2vw, 12px)',
                    fontFamily: "'Inter', sans-serif",
                    minHeight: 600,
                }}
                    className="print-container"
                >
                    {/* Header */}
                    <div className="stmt-header" style={{ 
                        display: 'flex', 
                        justifyContent: 'space-between', 
                        alignItems: 'flex-start', 
                        marginBottom: 'clamp(20px, 5vw, 32px)', 
                        paddingBottom: 'clamp(12px, 3vw, 20px)', 
                        borderBottom: '2px solid #e2e8f0',
                        gap: '16px',
                        flexWrap: 'wrap',
                    }}>
                        <div style={{ minWidth: 0, flex: '1 1 auto' }}>
                            <div style={{ 
                                fontSize: 'clamp(1.2rem, 3.5vw, 1.6rem)', 
                                fontWeight: 800, 
                                color: '#1e40af', 
                                marginBottom: '4px',
                                wordBreak: 'break-word',
                            }}>
                                FinanceBuddy
                            </div>
                            <div style={{ 
                                fontSize: 'clamp(0.7rem, 1.6vw, 0.8rem)', 
                                color: '#64748b',
                                wordBreak: 'break-word',
                            }}>
                                Business Finance Management System
                            </div>
                        </div>
                        <div style={{ textAlign: 'right', minWidth: 'fit-content' }}>
                            <div style={{ 
                                fontSize: 'clamp(0.85rem, 2.2vw, 1rem)', 
                                fontWeight: 700, 
                                color: '#1e293b',
                                wordBreak: 'break-word',
                            }}>
                                {statement.statement_number}
                            </div>
                            <div style={{ 
                                fontSize: 'clamp(0.65rem, 1.5vw, 0.75rem)', 
                                color: '#64748b', 
                                marginTop: '2px',
                                whiteSpace: 'nowrap',
                            }}>
                                FINANCIAL STATEMENT
                            </div>
                        </div>
                    </div>

                    {/* Account & User Info */}
                    <div className="info-grid" style={{ 
                        display: 'grid', 
                        gridTemplateColumns: '1fr 1fr', 
                        gap: 'clamp(16px, 4vw, 24px)', 
                        marginBottom: 'clamp(16px, 4vw, 24px)' 
                    }}>
                        <div>
                            <div style={{ 
                                fontSize: 'clamp(0.65rem, 1.5vw, 0.7rem)', 
                                fontWeight: 600, 
                                color: '#94a3b8', 
                                textTransform: 'uppercase', 
                                letterSpacing: '0.05em', 
                                marginBottom: '4px' 
                            }}>
                                Account Holder
                            </div>
                            <div style={{ 
                                fontSize: 'clamp(0.8rem, 2vw, 0.95rem)', 
                                fontWeight: 600, 
                                color: '#1e293b',
                                wordBreak: 'break-word',
                            }}>
                                {user || 'N/A'}
                            </div>
                            <div style={{ 
                                fontSize: 'clamp(0.7rem, 1.8vw, 0.8rem)', 
                                color: '#64748b', 
                                marginTop: '6px',
                                wordBreak: 'break-word',
                            }}>
                                Account: {account?.account_name}
                            </div>
                        </div>
                        <div className="period-info" style={{ textAlign: 'right' }}>
                            <div style={{ 
                                fontSize: 'clamp(0.65rem, 1.5vw, 0.7rem)', 
                                fontWeight: 600, 
                                color: '#94a3b8', 
                                textTransform: 'uppercase', 
                                letterSpacing: '0.05em', 
                                marginBottom: '4px' 
                            }}>
                                Statement Period
                            </div>
                            <div style={{ 
                                fontSize: 'clamp(0.75rem, 1.8vw, 0.9rem)', 
                                fontWeight: 600, 
                                color: '#1e293b',
                                wordBreak: 'break-word',
                            }}>
                                <span className="date-full">
                                    {formatDate(statement.start_date)} - {formatDate(statement.end_date)}
                                </span>
                                <span className="date-short" style={{ display: 'none' }}>
                                    {formatDate(statement.start_date).split(',')[0]} - {formatDate(statement.end_date).split(',')[0]}
                                </span>
                            </div>
                            <div style={{ 
                                fontSize: 'clamp(0.7rem, 1.6vw, 0.8rem)', 
                                color: '#64748b', 
                                marginTop: '6px' 
                            }}>
                                Generated: {new Date().toLocaleDateString()}
                            </div>
                        </div>
                    </div>

                    {/* Balance summary */}
                    <div className="balance-grid" style={{ 
                        display: 'grid', 
                        gridTemplateColumns: 'repeat(auto-fit, minmax(140px, 1fr))', 
                        gap: 'clamp(8px, 2vw, 12px)', 
                        marginBottom: 'clamp(16px, 4vw, 24px)' 
                    }}>
                        {[
                            { label: 'Opening Balance', value: statement.opening_balance, color: '#1e40af' },
                            { label: 'Total Credits', value: summary.totalCredit, color: '#059669' },
                            { label: 'Total Debits', value: summary.totalDebit, color: '#dc2626' },
                            { label: 'Closing Balance', value: statement.closing_balance, color: '#1e40af' },
                        ].map(item => (
                            <div key={item.label} style={{
                                background: '#f8fafc', 
                                border: '1px solid #e2e8f0',
                                borderRadius: 'clamp(6px, 1.5vw, 8px)', 
                                padding: 'clamp(10px, 2.5vw, 12px) clamp(10px, 2.5vw, 14px)',
                                minWidth: 0,
                            }}>
                                <div style={{ 
                                    fontSize: 'clamp(0.6rem, 1.4vw, 0.65rem)', 
                                    fontWeight: 600, 
                                    color: '#94a3b8', 
                                    textTransform: 'uppercase', 
                                    letterSpacing: '0.05em', 
                                    marginBottom: '4px',
                                    lineHeight: 1.35,
                                    overflowWrap: 'anywhere',
                                    wordBreak: 'break-word',
                                }}>
                                    {item.label}
                                </div>
                                <div style={{ 
                                    fontSize: 'clamp(0.8rem, 2vw, 0.95rem)', 
                                    fontWeight: 700, 
                                    color: item.color,
                                    wordBreak: 'break-word',
                                }}>
                                    {formatCurrency(item.value)}
                                </div>
                            </div>
                        ))}
                    </div>

                    {/* Transaction table */}
                    <div style={{ marginBottom: 'clamp(20px, 5vw, 32px)' }}>
                        <div style={{ 
                            fontSize: 'clamp(0.7rem, 1.8vw, 0.8rem)', 
                            fontWeight: 600, 
                            color: '#475569', 
                            textTransform: 'uppercase', 
                            letterSpacing: '0.05em', 
                            marginBottom: '10px' 
                        }}>
                            Transaction Details
                        </div>
                        <div style={{ overflowX: 'auto' }}>
                            <table style={{ 
                                width: '100%', 
                                borderCollapse: 'collapse', 
                                fontSize: 'clamp(0.64rem, 1.45vw, 0.72rem)',
                                minWidth: '600px',
                                tableLayout: 'fixed',
                            }}>
                                <thead>
                                    <tr style={{ background: '#1e40af', color: 'white' }}>
                                        <th style={{ 
                                            padding: 'clamp(8px, 2vw, 10px) clamp(8px, 2vw, 12px)', 
                                            textAlign: 'left', 
                                            fontWeight: 600,
                                            fontSize: 'clamp(0.6rem, 1.35vw, 0.68rem)',
                                        }}>Date</th>
                                        <th style={{ 
                                            padding: 'clamp(8px, 2vw, 10px) clamp(8px, 2vw, 12px)', 
                                            textAlign: 'left', 
                                            fontWeight: 600,
                                            fontSize: 'clamp(0.6rem, 1.35vw, 0.68rem)',
                                        }}>Type</th>
                                        <th className="hide-tablet" style={{ 
                                            padding: 'clamp(8px, 2vw, 10px) clamp(8px, 2vw, 12px)', 
                                            textAlign: 'left', 
                                            fontWeight: 600,
                                            fontSize: 'clamp(0.6rem, 1.35vw, 0.68rem)',
                                        }}>Category</th>
                                        <th className="hide-mobile" style={{ 
                                            padding: 'clamp(8px, 2vw, 10px) clamp(8px, 2vw, 12px)', 
                                            textAlign: 'left', 
                                            fontWeight: 600,
                                            fontSize: 'clamp(0.6rem, 1.35vw, 0.68rem)',
                                        }}>Remark</th>
                                        <th style={{ 
                                            padding: 'clamp(8px, 2vw, 10px) clamp(8px, 2vw, 12px)', 
                                            textAlign: 'right', 
                                            fontWeight: 600,
                                            fontSize: 'clamp(0.6rem, 1.35vw, 0.68rem)',
                                            width: '15%',
                                        }}>Credit</th>
                                        <th style={{ 
                                            padding: 'clamp(8px, 2vw, 10px) clamp(8px, 2vw, 12px)', 
                                            textAlign: 'right', 
                                            fontWeight: 600,
                                            fontSize: 'clamp(0.6rem, 1.35vw, 0.68rem)',
                                            width: '15%',
                                        }}>Debit</th>
                                        <th style={{ 
                                            padding: 'clamp(8px, 2vw, 10px) clamp(8px, 2vw, 12px)', 
                                            textAlign: 'right', 
                                            fontWeight: 600,
                                            fontSize: 'clamp(0.6rem, 1.35vw, 0.68rem)',
                                            width: '15%',
                                        }}>Balance</th>
                                    </tr>
                                </thead>
                                <tbody>
                                    {transactions.length === 0 && (
                                        <tr>
                                            <td colSpan={7} style={{ 
                                                textAlign: 'center', 
                                                padding: 'clamp(16px, 4vw, 20px)', 
                                                color: '#94a3b8',
                                                fontSize: 'clamp(0.75rem, 1.8vw, 0.85rem)',
                                            }}>
                                                No transactions in this period
                                            </td>
                                        </tr>
                                    )}
                                    {transactions.map((tx, i) => (
                                        <tr key={tx.id} style={{ background: i % 2 === 0 ? '#f8fafc' : '#ffffff' }}>
                                            <td style={{ 
                                                padding: 'clamp(7px, 1.8vw, 9px) clamp(8px, 2vw, 12px)', 
                                                color: '#475569', 
                                                whiteSpace: 'nowrap',
                                                fontSize: 'clamp(0.64rem, 1.45vw, 0.72rem)',
                                            }}>
                                                <span className="tx-date-full">{formatDate(tx.date)}</span>
                                                <span className="tx-date-short" style={{ display: 'none' }}>
                                                    {formatDate(tx.date).split(',')[0]}
                                                </span>
                                            </td>
                                            <td style={{ padding: 'clamp(7px, 1.8vw, 9px) clamp(8px, 2vw, 12px)' }}>
                                                <span style={{
                                                    background: tx.type === 'credit' ? '#dcfce7' : '#fee2e2',
                                                    color: tx.type === 'credit' ? '#166534' : '#991b1b',
                                                    padding: '2px clamp(6px, 1.5vw, 8px)', 
                                                    borderRadius: '4px', 
                                                    fontSize: 'clamp(0.65rem, 1.5vw, 0.72rem)', 
                                                    fontWeight: 600,
                                                    whiteSpace: 'nowrap',
                                                }}>
                                                    {tx.type.toUpperCase()}
                                                </span>
                                            </td>
                                            <td className="hide-tablet" style={{ 
                                                padding: 'clamp(7px, 1.8vw, 9px) clamp(8px, 2vw, 12px)', 
                                                color: '#475569',
                                                fontSize: 'clamp(0.64rem, 1.45vw, 0.72rem)',
                                            }}>
                                                {tx.categories?.name || '-'}
                                            </td>
                                            <td className="hide-mobile" style={{ 
                                                padding: 'clamp(7px, 1.8vw, 9px) clamp(8px, 2vw, 12px)', 
                                                color: '#64748b', 
                                                maxWidth: '220px',
                                                fontSize: 'clamp(0.64rem, 1.45vw, 0.72rem)',
                                                whiteSpace: 'normal',
                                                overflowWrap: 'anywhere',
                                                wordBreak: 'break-word',
                                                lineHeight: 1.3,
                                            }}>
                                                {tx.remark || '-'}
                                            </td>
                                            <td style={{ 
                                                padding: 'clamp(7px, 1.8vw, 9px) clamp(8px, 2vw, 12px)', 
                                                textAlign: 'right', 
                                                color: '#059669', 
                                                fontWeight: 600,
                                                fontSize: 'clamp(0.64rem, 1.45vw, 0.72rem)',
                                                whiteSpace: 'normal',
                                                overflowWrap: 'anywhere',
                                                wordBreak: 'break-word',
                                                lineHeight: 1.25,
                                            }}>
                                                <span style={{ display: 'inline-block', maxWidth: '100%' }}>
                                                    {tx.type === 'credit' ? formatCurrency(tx.amount) : ''}
                                                </span>
                                            </td>
                                            <td style={{ 
                                                padding: 'clamp(7px, 1.8vw, 9px) clamp(8px, 2vw, 12px)', 
                                                textAlign: 'right', 
                                                color: '#dc2626', 
                                                fontWeight: 600,
                                                fontSize: 'clamp(0.64rem, 1.45vw, 0.72rem)',
                                                whiteSpace: 'normal',
                                                overflowWrap: 'anywhere',
                                                wordBreak: 'break-word',
                                                lineHeight: 1.25,
                                            }}>
                                                <span style={{ display: 'inline-block', maxWidth: '100%' }}>
                                                    {tx.type === 'debit' ? formatCurrency(tx.amount) : ''}
                                                </span>
                                            </td>
                                            <td style={{ 
                                                padding: 'clamp(7px, 1.8vw, 9px) clamp(8px, 2vw, 12px)', 
                                                textAlign: 'right', 
                                                fontWeight: 700, 
                                                color: '#1e293b',
                                                fontSize: 'clamp(0.64rem, 1.45vw, 0.72rem)',
                                                whiteSpace: 'normal',
                                                overflowWrap: 'anywhere',
                                                wordBreak: 'break-word',
                                                lineHeight: 1.25,
                                            }}>
                                                <span style={{ display: 'inline-block', maxWidth: '100%' }}>
                                                    {formatCurrency(tx.running_balance)}
                                                </span>
                                            </td>
                                        </tr>
                                    ))}
                                </tbody>
                                <tfoot>
                                    <tr style={{ background: '#1e293b', color: 'white' }}>
                                        <td className="hide-mobile" colSpan={4} style={{ 
                                            padding: 'clamp(8px, 2vw, 10px) clamp(8px, 2vw, 12px)', 
                                            fontWeight: 600, 
                                            fontSize: 'clamp(0.56rem, 1.3vw, 0.62rem)' 
                                        }}>TOTALS</td>
                                        <td className="show-mobile" colSpan={2} style={{ 
                                            padding: 'clamp(8px, 2vw, 10px) clamp(8px, 2vw, 12px)', 
                                            fontWeight: 600, 
                                            fontSize: 'clamp(0.56rem, 1.3vw, 0.62rem)',
                                            display: 'none',
                                        }}>TOTALS</td>
                                        <td style={{ 
                                            padding: 'clamp(8px, 2vw, 10px) clamp(8px, 2vw, 12px)', 
                                            textAlign: 'right', 
                                            fontWeight: 700, 
                                            color: '#86efac',
                                            fontSize: 'clamp(0.58rem, 1.3vw, 0.64rem)',
                                            whiteSpace: 'normal',
                                            overflowWrap: 'anywhere',
                                            wordBreak: 'break-word',
                                            lineHeight: 1.25,
                                        }}>
                                            <span style={{ display: 'inline-block', maxWidth: '100%' }}>
                                                {formatCurrency(summary.totalCredit)}
                                            </span>
                                        </td>
                                        <td style={{ 
                                            padding: 'clamp(8px, 2vw, 10px) clamp(8px, 2vw, 12px)', 
                                            textAlign: 'right', 
                                            fontWeight: 700, 
                                            color: '#fca5a5',
                                            fontSize: 'clamp(0.58rem, 1.3vw, 0.64rem)',
                                            whiteSpace: 'normal',
                                            overflowWrap: 'anywhere',
                                            wordBreak: 'break-word',
                                            lineHeight: 1.25,
                                        }}>
                                            <span style={{ display: 'inline-block', maxWidth: '100%' }}>
                                                {formatCurrency(summary.totalDebit)}
                                            </span>
                                        </td>
                                        <td style={{ 
                                            padding: 'clamp(8px, 2vw, 10px) clamp(8px, 2vw, 12px)', 
                                            textAlign: 'right', 
                                            fontWeight: 700,
                                            fontSize: 'clamp(0.58rem, 1.3vw, 0.64rem)',
                                            whiteSpace: 'normal',
                                            overflowWrap: 'anywhere',
                                            wordBreak: 'break-word',
                                            lineHeight: 1.25,
                                        }}>
                                            <span style={{ display: 'inline-block', maxWidth: '100%' }}>
                                                {formatCurrency(statement.closing_balance)}
                                            </span>
                                        </td>
                                    </tr>
                                </tfoot>
                            </table>
                        </div>
                    </div>

                    {/* Net profit/loss */}
                    <div className="profit-box" style={{
                        padding: 'clamp(12px, 3vw, 14px) clamp(14px, 3.5vw, 20px)',
                        background: summary.profit >= 0 ? '#f0fdf4' : '#fef2f2',
                        border: `1px solid ${summary.profit >= 0 ? '#86efac' : '#fca5a5'}`,
                        borderRadius: 'clamp(6px, 1.5vw, 8px)',
                        display: 'flex',
                        justifyContent: 'space-between',
                        alignItems: 'center',
                        marginBottom: 'clamp(24px, 6vw, 40px)',
                        gap: '12px',
                        flexWrap: 'wrap',
                    }}>
                        <div style={{ minWidth: 0, flex: '1 1 auto' }}>
                            <div style={{ 
                                fontSize: 'clamp(0.7rem, 1.6vw, 0.75rem)', 
                                fontWeight: 600, 
                                color: '#64748b', 
                                textTransform: 'uppercase', 
                                letterSpacing: '0.05em',
                                wordBreak: 'break-word',
                            }}>
                                Net {summary.profit >= 0 ? 'Profit' : 'Loss'} for Period
                            </div>
                            <div style={{ 
                                fontSize: 'clamp(0.7rem, 1.6vw, 0.8rem)', 
                                color: '#94a3b8', 
                                marginTop: '2px' 
                            }}>
                                Total Credits - Total Debits
                            </div>
                        </div>
                        <div style={{ 
                            fontSize: 'clamp(1rem, 2.5vw, 1.2rem)', 
                            fontWeight: 800, 
                            color: summary.profit >= 0 ? '#059669' : '#dc2626',
                            whiteSpace: 'nowrap',
                        }}>
                            {summary.profit >= 0 ? '+' : '-'}{formatCurrency(Math.abs(summary.profit))}
                        </div>
                    </div>

                    {/* Signature area */}
                    <div className="signature-grid" style={{ 
                        display: 'grid', 
                        gridTemplateColumns: '1fr 1fr', 
                        gap: 'clamp(20px, 5vw, 40px)', 
                        paddingTop: 'clamp(16px, 4vw, 20px)', 
                        borderTop: '1px solid #e2e8f0' 
                    }}>
                        <div>
                            <div style={{ 
                                fontSize: 'clamp(0.65rem, 1.5vw, 0.72rem)', 
                                color: '#94a3b8', 
                                marginBottom: 'clamp(24px, 6vw, 40px)' 
                            }}>
                                Account Holder Signature
                            </div>
                            <div style={{ borderTop: '1px solid #cbd5e1', paddingTop: '6px' }}>
                                <div style={{ 
                                    fontSize: 'clamp(0.7rem, 1.6vw, 0.75rem)', 
                                    color: '#64748b',
                                    wordBreak: 'break-word',
                                }}>
                                    {user}
                                </div>
                            </div>
                        </div>
                        <div style={{ textAlign: 'right' }}>
                            <div style={{ 
                                fontSize: 'clamp(0.65rem, 1.5vw, 0.72rem)', 
                                color: '#94a3b8', 
                                marginBottom: 'clamp(24px, 6vw, 40px)' 
                            }}>
                                Authorized Signature
                            </div>
                            <div style={{ borderTop: '1px solid #cbd5e1', paddingTop: '6px' }}>
                                <div style={{ 
                                    fontSize: 'clamp(0.7rem, 1.6vw, 0.75rem)', 
                                    color: '#64748b' 
                                }}>
                                    FinanceBuddy System
                                </div>
                            </div>
                        </div>
                    </div>

                    <div style={{ 
                        textAlign: 'center', 
                        marginTop: 'clamp(16px, 4vw, 24px)', 
                        fontSize: 'clamp(0.65rem, 1.4vw, 0.7rem)', 
                        color: '#94a3b8',
                        lineHeight: 1.5,
                        padding: '0 16px',
                    }}>
                        This is a computer-generated statement. No physical signature is required. FinanceBuddy (c) {new Date().getFullYear()}
                    </div>
                </div>
            </div>

            <style>{`
                @media (max-width: 768px) {
                    .hide-mobile {
                        display: none !important;
                    }
                    .show-mobile {
                        display: table-cell !important;
                    }
                    .btn-label-full {
                        display: inline !important;
                    }
                    .btn-label {
                        display: none !important;
                    }
                    .date-full, .tx-date-full {
                        display: none !important;
                    }
                    .date-short, .tx-date-short {
                        display: inline !important;
                    }
                    .period-info {
                        text-align: left !important;
                    }
                    .stmt-header {
                        flex-direction: column !important;
                        align-items: flex-start !important;
                    }
                    .stmt-header > div:last-child {
                        text-align: left !important;
                    }
                }
                
                @media (max-width: 1024px) {
                    .hide-tablet {
                        display: none !important;
                    }
                }
                
                @media (max-width: 640px) {
                    .info-grid, .signature-grid {
                        grid-template-columns: 1fr !important;
                    }
                    .balance-grid {
                        grid-template-columns: repeat(2, 1fr) !important;
                    }
                    .action-buttons {
                        width: 100%;
                        justify-content: flex-end;
                    }
                    .profit-box {
                        flex-direction: column !important;
                        align-items: flex-start !important;
                    }
                }
                
                @media (max-width: 480px) {
                    .balance-grid {
                        grid-template-columns: 1fr !important;
                    }
                }
            `}</style>
        </div>
    )
}

