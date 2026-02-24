// pages/QuizPage.jsx — AI-powered Quiz Generator with generate, take, and results states
import React, { useState, useEffect, useCallback } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import axios from 'axios';
import { useAuth } from '../context/AuthContext';
import Button from '../components/ui/Button';

const API = 'http://localhost:5000';

export default function QuizPage() {
    const { id } = useParams();
    const { user, logout } = useAuth();
    const navigate = useNavigate();

    const handleLogout = () => { logout(); navigate('/'); };

    const [course, setCourse] = useState(null);
    const [loading, setLoading] = useState(true);

    // Quiz states: 'idle' | 'generating' | 'taking' | 'results'
    const [phase, setPhase] = useState('idle');
    const [quiz, setQuiz] = useState(null);
    const [currentQ, setCurrentQ] = useState(0);
    const [answers, setAnswers] = useState([]);
    const [results, setResults] = useState(null);
    const [history, setHistory] = useState([]);
    const [error, setError] = useState('');
    const [hoveredOption, setHoveredOption] = useState(null);

    const fetchCourse = useCallback(async () => {
        try {
            const { data } = await axios.get(`${API}/courses`);
            const found = data.find(c => String(c.id) === String(id));
            setCourse(found || null);
        } catch { setCourse(null); }
        setLoading(false);
    }, [id]);

    const fetchHistory = useCallback(async () => {
        try {
            const { data } = await axios.get(`${API}/courses/${id}/quiz/history`);
            setHistory(data);
        } catch { /* ignore */ }
    }, [id]);

    useEffect(() => { fetchCourse(); fetchHistory(); }, [fetchCourse, fetchHistory]);

    const generateQuiz = async () => {
        setPhase('generating');
        setError('');
        try {
            const { data } = await axios.post(`${API}/courses/${id}/quiz/generate`);
            setQuiz(data);
            setAnswers(new Array(data.questions.length).fill(-1));
            setCurrentQ(0);
            setPhase('taking');
        } catch (err) {
            setError(err.response?.data?.error || 'Failed to generate quiz');
            setPhase('idle');
        }
    };

    const selectAnswer = (index) => {
        const updated = [...answers];
        updated[currentQ] = index;
        setAnswers(updated);
    };

    const submitQuiz = async () => {
        if (!quiz) return;
        setPhase('generating'); // reuse loading state
        try {
            const { data } = await axios.post(`${API}/courses/${id}/quiz/${quiz.id}/submit`, { answers });
            setResults(data);
            setPhase('results');
            fetchHistory();
        } catch (err) {
            setError(err.response?.data?.error || 'Failed to submit quiz');
            setPhase('taking');
        }
    };

    const resetQuiz = () => {
        setQuiz(null);
        setResults(null);
        setAnswers([]);
        setCurrentQ(0);
        setPhase('idle');
        setError('');
    };

    if (loading) {
        return (
            <div style={{ minHeight: '100vh', display: 'flex', alignItems: 'center', justifyContent: 'center', background: 'var(--ground)' }}>
                <div className="spinner" />
            </div>
        );
    }

    const allAnswered = answers.length > 0 && answers.every(a => a >= 0);

    return (
        <div style={{ minHeight: '100vh', background: 'var(--ground)', fontFamily: 'var(--font-body)' }}>
            {/* ── Navbar ──────────────────────────────── */}
            <header style={{
                height: '64px',
                background: 'var(--surface)',
                borderBottom: '1px solid var(--border)',
                position: 'sticky',
                top: 0,
                zIndex: 100,
                boxShadow: 'var(--s1)',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'space-between',
                padding: '0 32px',
            }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: '10px', cursor: 'pointer' }}
                    onClick={() => navigate('/dashboard')}>
                    <div style={{ width: '8px', height: '8px', borderRadius: '2px', background: 'var(--blue)' }} />
                    <span style={{ fontFamily: 'var(--font-display)', fontSize: '20px', color: 'var(--ink)' }}>StudyBuddy</span>
                </div>
                <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                    <Button variant="ghost" size="sm" onClick={() => navigate(`/courses/${id}`)}>← Back to Course</Button>
                    <div style={{ width: '1px', height: '24px', background: 'var(--border)', margin: '0 4px' }} />
                    <div style={{
                        width: '34px', height: '34px', borderRadius: '50%',
                        background: 'linear-gradient(135deg, var(--blue), var(--purple))',
                        display: 'flex', alignItems: 'center', justifyContent: 'center',
                        color: 'white', fontSize: '13px', fontWeight: 700,
                    }}>
                        {user?.name?.charAt(0)?.toUpperCase() || 'U'}
                    </div>
                    <Button variant="ghost" size="sm" onClick={handleLogout}>Logout</Button>
                </div>
            </header>

            {/* ── Main ────────────────────────────────── */}
            <main style={{
                maxWidth: '800px',
                margin: '0 auto',
                padding: '40px 32px 80px',
                animation: 'fadeInUp 0.3s var(--ease-out) both',
            }}>
                {/* Page Header */}
                <div style={{ marginBottom: '32px' }}>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '8px' }}>
                        <span style={{ fontSize: '28px' }}>🧠</span>
                        <h1 style={{
                            fontFamily: 'var(--font-display)',
                            fontSize: '28px',
                            color: 'var(--ink)',
                        }}>
                            Quiz Generator
                        </h1>
                    </div>
                    <p style={{ fontSize: '14px', color: 'var(--muted)' }}>
                        {course?.name} — AI-powered quizzes from your study material
                    </p>
                </div>

                {/* ── IDLE: Generate Button ────────────── */}
                {phase === 'idle' && (
                    <div style={{ animation: 'fadeInUp 0.3s var(--ease-out) both' }}>
                        <div style={{
                            background: 'var(--surface)',
                            border: '1px solid var(--border)',
                            borderRadius: 'var(--r-lg)',
                            padding: '48px',
                            textAlign: 'center',
                            marginBottom: '32px',
                        }}>
                            <div style={{
                                width: '72px', height: '72px', borderRadius: '20px',
                                background: 'linear-gradient(135deg, var(--purple-soft), var(--blue-soft))',
                                display: 'flex', alignItems: 'center', justifyContent: 'center',
                                fontSize: '32px', margin: '0 auto 20px',
                            }}>
                                🧠
                            </div>
                            <h2 style={{
                                fontFamily: 'var(--font-display)',
                                fontSize: '24px',
                                color: 'var(--ink)',
                                marginBottom: '8px',
                            }}>
                                Test your knowledge
                            </h2>
                            <p style={{
                                fontSize: '14px',
                                color: 'var(--muted)',
                                marginBottom: '28px',
                                maxWidth: '400px',
                                margin: '0 auto 28px',
                                lineHeight: 1.7,
                            }}>
                                AI will generate 5 multiple-choice questions from your notes and PDF summaries for this course.
                            </p>

                            {error && (
                                <div style={{
                                    padding: '12px 16px',
                                    background: 'var(--red-soft)',
                                    border: '1px solid #fecaca',
                                    borderRadius: 'var(--r)',
                                    color: 'var(--red)',
                                    fontSize: '13px',
                                    fontWeight: 500,
                                    marginBottom: '20px',
                                    textAlign: 'left',
                                }}>
                                    ⚠️ {error}
                                </div>
                            )}

                            <Button variant="primary" size="lg" onClick={generateQuiz} icon="✨">
                                Generate Quiz
                            </Button>
                        </div>

                        {/* Quiz History */}
                        {history.length > 0 && (
                            <div>
                                <h3 style={{
                                    fontSize: '16px',
                                    fontWeight: 700,
                                    color: 'var(--ink)',
                                    marginBottom: '16px',
                                }}>
                                    📋 Past Quizzes
                                </h3>
                                <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
                                    {history.map(h => (
                                        <div key={h.id} style={{
                                            background: 'var(--surface)',
                                            border: '1px solid var(--border)',
                                            borderRadius: 'var(--r)',
                                            padding: '16px 20px',
                                            display: 'flex',
                                            justifyContent: 'space-between',
                                            alignItems: 'center',
                                        }}>
                                            <div>
                                                <div style={{ fontSize: '14px', fontWeight: 600, color: 'var(--ink)' }}>{h.title}</div>
                                                <div style={{ fontSize: '12px', color: 'var(--muted)', marginTop: '2px' }}>
                                                    {new Date(h.created_at).toLocaleDateString('en-US', { month: 'short', day: 'numeric', hour: '2-digit', minute: '2-digit' })}
                                                </div>
                                            </div>
                                            {h.score !== null ? (
                                                <div style={{
                                                    padding: '6px 14px',
                                                    borderRadius: '20px',
                                                    fontSize: '13px',
                                                    fontWeight: 700,
                                                    background: h.score / h.total >= 0.8 ? 'var(--green-soft)' : h.score / h.total >= 0.5 ? 'var(--gold-soft)' : 'var(--red-soft)',
                                                    color: h.score / h.total >= 0.8 ? 'var(--green)' : h.score / h.total >= 0.5 ? 'var(--gold)' : 'var(--red)',
                                                }}>
                                                    {h.score}/{h.total} ({Math.round(h.score / h.total * 100)}%)
                                                </div>
                                            ) : (
                                                <span style={{ fontSize: '12px', color: 'var(--subtle)' }}>Not completed</span>
                                            )}
                                        </div>
                                    ))}
                                </div>
                            </div>
                        )}
                    </div>
                )}

                {/* ── GENERATING: Loading ──────────────── */}
                {phase === 'generating' && (
                    <div style={{
                        background: 'var(--surface)',
                        border: '1px solid var(--border)',
                        borderRadius: 'var(--r-lg)',
                        padding: '64px 48px',
                        textAlign: 'center',
                        animation: 'fadeInUp 0.3s var(--ease-out) both',
                    }}>
                        <div className="spinner" style={{ margin: '0 auto 24px' }} />
                        <h3 style={{
                            fontFamily: 'var(--font-display)',
                            fontSize: '20px',
                            color: 'var(--ink)',
                            marginBottom: '8px',
                        }}>
                            Generating your quiz...
                        </h3>
                        <p style={{ fontSize: '14px', color: 'var(--muted)' }}>
                            AI is reading your study material and crafting questions
                        </p>
                    </div>
                )}

                {/* ── TAKING: Question Card ────────────── */}
                {phase === 'taking' && quiz && (
                    <div style={{ animation: 'fadeInUp 0.3s var(--ease-out) both' }}>
                        {/* Progress bar */}
                        <div style={{
                            display: 'flex',
                            alignItems: 'center',
                            gap: '12px',
                            marginBottom: '24px',
                        }}>
                            <span style={{ fontSize: '13px', fontWeight: 600, color: 'var(--muted)', minWidth: '60px' }}>
                                {currentQ + 1} of {quiz.questions.length}
                            </span>
                            <div style={{
                                flex: 1, height: '6px', borderRadius: '3px',
                                background: 'var(--sunken)',
                                overflow: 'hidden',
                            }}>
                                <div style={{
                                    width: `${((currentQ + 1) / quiz.questions.length) * 100}%`,
                                    height: '100%',
                                    borderRadius: '3px',
                                    background: 'linear-gradient(90deg, var(--blue), var(--purple))',
                                    transition: 'width 0.4s cubic-bezier(0.16,1,0.3,1)',
                                }} />
                            </div>
                        </div>

                        {/* Question card */}
                        <div style={{
                            background: 'var(--surface)',
                            border: '1px solid var(--border)',
                            borderRadius: 'var(--r-lg)',
                            padding: '36px',
                            marginBottom: '24px',
                        }}>
                            <h2 style={{
                                fontFamily: 'var(--font-display)',
                                fontSize: '20px',
                                color: 'var(--ink)',
                                lineHeight: 1.5,
                                marginBottom: '28px',
                            }}>
                                {quiz.questions[currentQ].question}
                            </h2>

                            <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
                                {quiz.questions[currentQ].options.map((opt, i) => {
                                    const selected = answers[currentQ] === i;
                                    const hovered = hoveredOption === i;
                                    const letter = ['A', 'B', 'C', 'D'][i];
                                    return (
                                        <div
                                            key={i}
                                            onClick={() => selectAnswer(i)}
                                            onMouseEnter={() => setHoveredOption(i)}
                                            onMouseLeave={() => setHoveredOption(null)}
                                            style={{
                                                display: 'flex',
                                                alignItems: 'center',
                                                gap: '14px',
                                                padding: '16px 20px',
                                                borderRadius: 'var(--r)',
                                                border: `2px solid ${selected ? 'var(--blue)' : hovered ? 'var(--border-hover, #d1d5db)' : 'var(--border)'}`,
                                                background: selected ? 'var(--blue-soft)' : hovered ? 'var(--sunken)' : 'var(--surface)',
                                                cursor: 'pointer',
                                                transition: 'all 0.15s ease',
                                            }}
                                        >
                                            <div style={{
                                                width: '32px', height: '32px', borderRadius: '8px',
                                                background: selected ? 'var(--blue)' : 'var(--sunken)',
                                                color: selected ? 'white' : 'var(--muted)',
                                                display: 'flex', alignItems: 'center', justifyContent: 'center',
                                                fontSize: '13px', fontWeight: 700, flexShrink: 0,
                                                transition: 'all 0.15s ease',
                                            }}>
                                                {letter}
                                            </div>
                                            <span style={{
                                                fontSize: '14px',
                                                color: selected ? 'var(--blue)' : 'var(--ink)',
                                                fontWeight: selected ? 600 : 400,
                                                lineHeight: 1.5,
                                            }}>
                                                {opt}
                                            </span>
                                        </div>
                                    );
                                })}
                            </div>
                        </div>

                        {/* Navigation buttons */}
                        <div style={{
                            display: 'flex',
                            justifyContent: 'space-between',
                            alignItems: 'center',
                        }}>
                            <Button
                                variant="ghost"
                                onClick={() => setCurrentQ(q => Math.max(0, q - 1))}
                                disabled={currentQ === 0}
                            >
                                ← Previous
                            </Button>

                            {currentQ < quiz.questions.length - 1 ? (
                                <Button
                                    variant="primary"
                                    onClick={() => setCurrentQ(q => q + 1)}
                                    disabled={answers[currentQ] < 0}
                                >
                                    Next →
                                </Button>
                            ) : (
                                <Button
                                    variant="primary"
                                    onClick={submitQuiz}
                                    disabled={!allAnswered}
                                    icon="📤"
                                >
                                    Submit Quiz
                                </Button>
                            )}
                        </div>
                    </div>
                )}

                {/* ── RESULTS: Score & Review ─────────── */}
                {phase === 'results' && results && (
                    <div style={{ animation: 'fadeInUp 0.3s var(--ease-out) both' }}>
                        {/* Score Card */}
                        <div style={{
                            background: 'var(--surface)',
                            border: '1px solid var(--border)',
                            borderRadius: 'var(--r-lg)',
                            padding: '48px',
                            textAlign: 'center',
                            marginBottom: '32px',
                        }}>
                            {/* Score Ring */}
                            <div style={{ position: 'relative', width: '120px', height: '120px', margin: '0 auto 24px' }}>
                                <svg width="120" height="120" viewBox="0 0 120 120">
                                    <circle cx="60" cy="60" r="52" fill="none" stroke="var(--sunken)" strokeWidth="8" />
                                    <circle
                                        cx="60" cy="60" r="52" fill="none"
                                        stroke={results.percentage >= 80 ? 'var(--green)' : results.percentage >= 50 ? 'var(--gold)' : 'var(--red)'}
                                        strokeWidth="8"
                                        strokeLinecap="round"
                                        strokeDasharray={`${(results.percentage / 100) * 326.73} 326.73`}
                                        transform="rotate(-90 60 60)"
                                        style={{ transition: 'stroke-dasharray 1s cubic-bezier(0.16,1,0.3,1)' }}
                                    />
                                </svg>
                                <div style={{
                                    position: 'absolute', inset: 0,
                                    display: 'flex', flexDirection: 'column',
                                    alignItems: 'center', justifyContent: 'center',
                                }}>
                                    <span style={{
                                        fontFamily: 'var(--font-display)',
                                        fontSize: '32px',
                                        color: 'var(--ink)',
                                        lineHeight: 1,
                                    }}>
                                        {results.percentage}%
                                    </span>
                                </div>
                            </div>

                            <h2 style={{
                                fontFamily: 'var(--font-display)',
                                fontSize: '24px',
                                color: 'var(--ink)',
                                marginBottom: '6px',
                            }}>
                                {results.percentage >= 80 ? '🎉 Excellent!' : results.percentage >= 50 ? '👍 Good try!' : '💪 Keep studying!'}
                            </h2>
                            <p style={{ fontSize: '15px', color: 'var(--muted)' }}>
                                You scored {results.score} out of {results.total}
                            </p>

                            <div style={{ display: 'flex', gap: '12px', justifyContent: 'center', marginTop: '28px' }}>
                                <Button variant="primary" onClick={generateQuiz} icon="🔄">Try Again</Button>
                                <Button variant="outline" onClick={resetQuiz}>Back to Overview</Button>
                            </div>
                        </div>

                        {/* Per-question Review */}
                        <h3 style={{
                            fontSize: '16px',
                            fontWeight: 700,
                            color: 'var(--ink)',
                            marginBottom: '16px',
                        }}>
                            📖 Review Answers
                        </h3>
                        <div style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
                            {results.results.map((r, qi) => (
                                <div key={qi} style={{
                                    background: 'var(--surface)',
                                    border: `1.5px solid ${r.correct ? 'var(--green)' : 'var(--red)'}`,
                                    borderRadius: 'var(--r-lg)',
                                    padding: '24px',
                                    animation: `fadeInUp 0.3s var(--ease-out) ${qi * 0.05}s both`,
                                }}>
                                    <div style={{ display: 'flex', alignItems: 'flex-start', gap: '10px', marginBottom: '16px' }}>
                                        <span style={{ fontSize: '18px', flexShrink: 0 }}>{r.correct ? '✅' : '❌'}</span>
                                        <span style={{
                                            fontSize: '15px',
                                            fontWeight: 600,
                                            color: 'var(--ink)',
                                            lineHeight: 1.5,
                                        }}>
                                            {r.question}
                                        </span>
                                    </div>
                                    <div style={{ display: 'flex', flexDirection: 'column', gap: '6px', paddingLeft: '28px' }}>
                                        {r.options.map((opt, oi) => {
                                            const isCorrect = oi === r.correctIndex;
                                            const isSelected = oi === r.selectedIndex;
                                            let bg = 'transparent';
                                            let borderColor = 'var(--border)';
                                            let textColor = 'var(--muted)';
                                            if (isCorrect) {
                                                bg = 'var(--green-soft)';
                                                borderColor = 'var(--green)';
                                                textColor = 'var(--green)';
                                            } else if (isSelected && !isCorrect) {
                                                bg = 'var(--red-soft)';
                                                borderColor = 'var(--red)';
                                                textColor = 'var(--red)';
                                            }
                                            return (
                                                <div key={oi} style={{
                                                    padding: '10px 14px',
                                                    borderRadius: 'var(--r-sm)',
                                                    border: `1.5px solid ${borderColor}`,
                                                    background: bg,
                                                    fontSize: '13px',
                                                    fontWeight: (isCorrect || isSelected) ? 600 : 400,
                                                    color: textColor,
                                                    display: 'flex',
                                                    alignItems: 'center',
                                                    gap: '8px',
                                                }}>
                                                    <span style={{ fontWeight: 700 }}>{['A', 'B', 'C', 'D'][oi]}.</span>
                                                    {opt}
                                                    {isCorrect && <span style={{ marginLeft: 'auto' }}>✓</span>}
                                                    {isSelected && !isCorrect && <span style={{ marginLeft: 'auto' }}>✗</span>}
                                                </div>
                                            );
                                        })}
                                    </div>
                                </div>
                            ))}
                        </div>
                    </div>
                )}
            </main>
        </div>
    );
}
