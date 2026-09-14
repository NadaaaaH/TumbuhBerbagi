import React, { useCallback, useRef, useState, useEffect } from 'react';
import { useEditor, EditorContent } from '@tiptap/react';
import StarterKit from '@tiptap/starter-kit';
import Image from '@tiptap/extension-image';
import Underline from '@tiptap/extension-underline';
import Subscript from '@tiptap/extension-subscript';
import Superscript from '@tiptap/extension-superscript';
import Link from '@tiptap/extension-link';
import axios from 'axios';
import {
    Bold,
    Italic,
    Underline as UnderlineIcon,
    Strikethrough,
    List,
    ListOrdered,
    Subscript as SubscriptIcon,
    Superscript as SuperscriptIcon,
    Image as ImageIcon,
    Link as LinkIcon,
    Unlink as LinkOff,
    RemoveFormatting,
    ChevronDown,
    Undo,
    Redo,
    AlignLeft,
    Quote,
    Minus,
} from 'lucide-react';

// ─── Konstanta opsi style ────────────────────────────────────────────────────
const BLOCK_OPTIONS = [
    { label: 'Normal',    value: 'paragraph' },
    { label: 'Judul 1',  value: 'h2' },
    { label: 'Judul 2',  value: 'h3' },
    { label: 'Judul 3',  value: 'h4' },
    { label: 'Kutipan',  value: 'blockquote' },
];

// ─── Helpers ─────────────────────────────────────────────────────────────────
function getActiveBlockLabel(editor) {
    if (!editor) return 'Normal';
    if (editor.isActive('heading', { level: 2 })) return 'Judul 1';
    if (editor.isActive('heading', { level: 3 })) return 'Judul 2';
    if (editor.isActive('heading', { level: 4 })) return 'Judul 3';
    if (editor.isActive('blockquote')) return 'Kutipan';
    return 'Normal';
}

function applyBlockStyle(editor, value) {
    if (!editor) return;
    switch (value) {
        case 'h2':        editor.chain().focus().toggleHeading({ level: 2 }).run(); break;
        case 'h3':        editor.chain().focus().toggleHeading({ level: 3 }).run(); break;
        case 'h4':        editor.chain().focus().toggleHeading({ level: 4 }).run(); break;
        case 'blockquote':editor.chain().focus().toggleBlockquote().run(); break;
        default:          editor.chain().focus().setParagraph().run(); break;
    }
}

// ─── Komponen kecil ──────────────────────────────────────────────────────────
function Sep() {
    return <div className="w-px h-5 bg-slate-200 mx-0.5 flex-shrink-0 self-center" />;
}

function TBtn({ onClick, active = false, title, children, disabled = false }) {
    return (
        <button
            type="button"
            onMouseDown={(e) => { e.preventDefault(); if (!disabled) onClick(); }}
            title={title}
            disabled={disabled}
            className={`flex items-center justify-center w-7 h-7 rounded-md text-[13px] transition-all duration-150 flex-shrink-0 ${
                active
                    ? 'bg-[#1b5e20] text-white shadow-sm'
                    : 'text-slate-600 hover:bg-slate-100 hover:text-slate-800'
            } ${disabled ? 'opacity-35 cursor-not-allowed' : 'cursor-pointer'}`}
        >
            {children}
        </button>
    );
}

// ─── Block Style Dropdown ─────────────────────────────────────────────────────
function BlockDropdown({ editor }) {
    const [open, setOpen] = useState(false);
    const ref = useRef(null);
    const activeLabel = getActiveBlockLabel(editor);

    useEffect(() => {
        function handleClickOutside(e) {
            if (ref.current && !ref.current.contains(e.target)) setOpen(false);
        }
        document.addEventListener('mousedown', handleClickOutside);
        return () => document.removeEventListener('mousedown', handleClickOutside);
    }, []);

    return (
        <div ref={ref} className="relative flex-shrink-0">
            <button
                type="button"
                onMouseDown={(e) => { e.preventDefault(); setOpen(v => !v); }}
                className="flex items-center gap-1 h-7 px-2 rounded-md text-[12px] font-medium text-slate-700 hover:bg-slate-100 transition-all border border-slate-200 min-w-[90px] justify-between"
            >
                <span>{activeLabel}</span>
                <ChevronDown size={11} className={`text-slate-400 transition-transform ${open ? 'rotate-180' : ''}`} />
            </button>

            {open && (
                <div className="absolute top-full left-0 mt-1 bg-white border border-slate-200 rounded-xl shadow-xl z-50 overflow-hidden min-w-[130px]">
                    {BLOCK_OPTIONS.map(opt => (
                        <button
                            key={opt.value}
                            type="button"
                            onMouseDown={(e) => {
                                e.preventDefault();
                                applyBlockStyle(editor, opt.value);
                                setOpen(false);
                            }}
                            className={`w-full text-left px-3 py-2 text-[13px] transition-colors ${
                                activeLabel === opt.label
                                    ? 'bg-[#1b5e20]/10 text-[#1b5e20] font-semibold'
                                    : 'hover:bg-slate-50 text-slate-700'
                            } ${opt.value === 'h2' ? 'text-[15px] font-bold' : ''}
                              ${opt.value === 'h3' ? 'text-[14px] font-semibold' : ''}
                              ${opt.value === 'h4' ? 'text-[13px] font-medium' : ''}
                            `}
                        >
                            {opt.label}
                        </button>
                    ))}
                </div>
            )}
        </div>
    );
}

// ─── Link Dialog ──────────────────────────────────────────────────────────────
function LinkDialog({ onSubmit, onClose, initialUrl = '' }) {
    const [url, setUrl] = useState(initialUrl);
    const inputRef = useRef(null);

    useEffect(() => { inputRef.current?.focus(); }, []);

    const handleKeyDown = (e) => {
        if (e.key === 'Enter') { e.preventDefault(); onSubmit(url); }
        if (e.key === 'Escape') onClose();
    };

    return (
        <div className="fixed inset-0 z-[9999] flex items-center justify-center p-4" onClick={onClose}>
            <div className="absolute inset-0 bg-black/20 backdrop-blur-sm" />
            <div
                className="relative bg-white rounded-2xl shadow-2xl border border-slate-100 p-6 w-full max-w-sm"
                onClick={e => e.stopPropagation()}
            >
                <h3 className="font-semibold text-slate-800 mb-4 text-sm">Tambah / Edit Tautan</h3>
                <input
                    ref={inputRef}
                    type="url"
                    value={url}
                    onChange={e => setUrl(e.target.value)}
                    onKeyDown={handleKeyDown}
                    placeholder="https://contoh.com"
                    className="w-full px-3 py-2 text-sm border border-slate-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#1b5e20] focus:border-[#1b5e20] mb-4"
                />
                <div className="flex gap-2 justify-end">
                    <button
                        type="button"
                        onClick={onClose}
                        className="px-4 py-2 text-sm text-slate-500 hover:text-slate-700 rounded-lg hover:bg-slate-50 transition-colors"
                    >
                        Batal
                    </button>
                    <button
                        type="button"
                        onClick={() => onSubmit(url)}
                        className="px-4 py-2 text-sm bg-[#1b5e20] text-white rounded-lg hover:bg-[#144718] transition-colors font-medium"
                    >
                        Simpan
                    </button>
                </div>
            </div>
        </div>
    );
}

// ─── Main RichTextEditor ──────────────────────────────────────────────────────
export default function RichTextEditor({
    value,
    onChange,
    placeholder = 'Tulis deskripsi di sini...',
    minHeight = '220px',
}) {
    const [linkDialogOpen, setLinkDialogOpen] = useState(false);
    const [uploading, setUploading] = useState(false);

    const editor = useEditor({
        extensions: [
            StarterKit.configure({
                heading: { levels: [2, 3, 4] },
            }),
            Image.configure({
                inline: false,
                allowBase64: false,
                HTMLAttributes: {
                    class: 'rounded-xl max-w-full my-4 shadow-sm border border-slate-100',
                },
            }),
            Underline,
            Subscript,
            Superscript,
            Link.configure({
                openOnClick: false,
                HTMLAttributes: {
                    class: 'text-[#1b5e20] underline underline-offset-2 hover:text-[#144718] cursor-pointer',
                    rel: 'noopener noreferrer',
                    target: '_blank',
                },
            }),
        ],
        content: value || '',
        onUpdate({ editor }) {
            onChange(editor.getHTML());
        },
        editorProps: {
            attributes: {
                class: `prose prose-slate prose-sm sm:prose-base max-w-none focus:outline-none p-4 leading-relaxed`,
                style: `min-height: ${minHeight}`,
            },
        },
    });

    // ── Sync konten editor saat value berubah dari luar (misal: data dari DB sudah siap) ──
    useEffect(() => {
        if (!editor) return;
        const current = editor.getHTML();
        // Hanya update jika konten berbeda agar tidak loop tak terbatas
        if (value && value !== current) {
            editor.commands.setContent(value, false);
        }
    }, [editor, value]);

    // ── Upload gambar ──────────────────────────────────────────────────────────
    const handleImageUpload = useCallback(async () => {
        if (!editor || uploading) return;
        const input = document.createElement('input');
        input.type = 'file';
        input.accept = 'image/jpeg,image/png,image/gif,image/webp';
        input.onchange = async () => {
            const file = input.files?.[0];
            if (!file) return;
            setUploading(true);
            try {
                const formData = new FormData();
                formData.append('image', file);
                const { data } = await axios.post(route('kegiatan.upload-image'), formData, {
                    headers: { 'Content-Type': 'multipart/form-data' },
                });
                editor.chain().focus().setImage({ src: data.url, alt: file.name }).run();
            } catch {
                alert('Gagal mengunggah gambar. Maksimal ukuran 4MB.');
            } finally {
                setUploading(false);
            }
        };
        input.click();
    }, [editor, uploading]);

    // ── Link dialog ────────────────────────────────────────────────────────────
    const handleLinkOpen = useCallback(() => {
        if (!editor) return;
        setLinkDialogOpen(true);
    }, [editor]);

    const handleLinkSubmit = useCallback((url) => {
        if (!editor) return;
        setLinkDialogOpen(false);
        if (!url) {
            editor.chain().focus().unsetLink().run();
            return;
        }
        const href = url.startsWith('http') ? url : `https://${url}`;
        editor.chain().focus().extendMarkToLink({ href }).setLink({ href }).run();
    }, [editor]);

    // ── Clear all formatting ───────────────────────────────────────────────────
    const clearFormatting = useCallback(() => {
        if (!editor) return;
        editor.chain().focus()
            .unsetBold()
            .unsetItalic()
            .unsetUnderline()
            .unsetStrike()
            .unsetSubscript()
            .unsetSuperscript()
            .unsetLink()
            .setParagraph()
            .run();
    }, [editor]);

    if (!editor) return (
        <div className="border border-slate-200 rounded-xl bg-slate-50 animate-pulse" style={{ minHeight: '200px' }} />
    );

    return (
        <>
            {linkDialogOpen && (
                <LinkDialog
                    onSubmit={handleLinkSubmit}
                    onClose={() => setLinkDialogOpen(false)}
                    initialUrl={editor.getAttributes('link').href || ''}
                />
            )}

            <div className="border border-slate-200 rounded-xl overflow-hidden focus-within:border-[#1b5e20] focus-within:ring-1 focus-within:ring-[#1b5e20] transition-all duration-200 bg-white shadow-sm">

                {/* ── Toolbar ─────────────────────────────────────────────────── */}
                <div className="flex flex-wrap items-center gap-0.5 px-2 py-1.5 border-b border-slate-100 bg-slate-50/80">

                    {/* Block style dropdown */}
                    <BlockDropdown editor={editor} />

                    <Sep />

                    {/* History */}
                    <TBtn onClick={() => editor.chain().focus().undo().run()} disabled={!editor.can().undo()} title="Undo (Ctrl+Z)">
                        <Undo size={14} />
                    </TBtn>
                    <TBtn onClick={() => editor.chain().focus().redo().run()} disabled={!editor.can().redo()} title="Redo (Ctrl+Y)">
                        <Redo size={14} />
                    </TBtn>

                    <Sep />

                    {/* Inline formatting */}
                    <TBtn onClick={() => editor.chain().focus().toggleBold().run()} active={editor.isActive('bold')} title="Tebal (Ctrl+B)">
                        <Bold size={14} />
                    </TBtn>
                    <TBtn onClick={() => editor.chain().focus().toggleItalic().run()} active={editor.isActive('italic')} title="Miring (Ctrl+I)">
                        <Italic size={14} />
                    </TBtn>
                    <TBtn onClick={() => editor.chain().focus().toggleUnderline().run()} active={editor.isActive('underline')} title="Garis Bawah (Ctrl+U)">
                        <UnderlineIcon size={14} />
                    </TBtn>
                    <TBtn onClick={() => editor.chain().focus().toggleStrike().run()} active={editor.isActive('strike')} title="Coret">
                        <Strikethrough size={14} />
                    </TBtn>

                    <Sep />

                    {/* Lists */}
                    <TBtn onClick={() => editor.chain().focus().toggleOrderedList().run()} active={editor.isActive('orderedList')} title="Daftar Bernomor">
                        <ListOrdered size={14} />
                    </TBtn>
                    <TBtn onClick={() => editor.chain().focus().toggleBulletList().run()} active={editor.isActive('bulletList')} title="Daftar Butir">
                        <List size={14} />
                    </TBtn>

                    <Sep />

                    {/* Sub / Super */}
                    <TBtn onClick={() => editor.chain().focus().toggleSubscript().run()} active={editor.isActive('subscript')} title="Subscript (x₂)">
                        <SubscriptIcon size={14} />
                    </TBtn>
                    <TBtn onClick={() => editor.chain().focus().toggleSuperscript().run()} active={editor.isActive('superscript')} title="Superscript (x²)">
                        <SuperscriptIcon size={14} />
                    </TBtn>

                    <Sep />

                    {/* Image */}
                    <TBtn onClick={handleImageUpload} disabled={uploading} title={uploading ? 'Mengunggah...' : 'Sisipkan Gambar'}>
                        {uploading
                            ? <span className="w-3.5 h-3.5 border-2 border-slate-400 border-t-[#1b5e20] rounded-full animate-spin" />
                            : <ImageIcon size={14} />
                        }
                    </TBtn>

                    {/* Link */}
                    <TBtn onClick={handleLinkOpen} active={editor.isActive('link')} title="Tambah Tautan">
                        <LinkIcon size={14} />
                    </TBtn>
                    {editor.isActive('link') && (
                        <TBtn onClick={() => editor.chain().focus().unsetLink().run()} title="Hapus Tautan">
                            <LinkOff size={14} />
                        </TBtn>
                    )}

                    <Sep />

                    {/* Extras */}
                    <TBtn onClick={() => editor.chain().focus().toggleBlockquote().run()} active={editor.isActive('blockquote')} title="Kutipan">
                        <Quote size={14} />
                    </TBtn>
                    <TBtn onClick={() => editor.chain().focus().setHorizontalRule().run()} title="Garis Pemisah">
                        <Minus size={14} />
                    </TBtn>

                    <Sep />

                    {/* Clear formatting */}
                    <TBtn onClick={clearFormatting} title="Hapus Semua Pemformatan">
                        <RemoveFormatting size={14} />
                    </TBtn>
                </div>

                {/* ── Editor Area ─────────────────────────────────────────────── */}
                <div className="relative">
                    <EditorContent editor={editor} />
                    {/* Placeholder — hanya muncul saat editor kosong */}
                    {editor.isEmpty && (
                        <div className="absolute top-4 left-4 pointer-events-none text-slate-400 text-sm select-none">
                            {placeholder}
                        </div>
                    )}
                </div>

                {/* ── Footer hint ─────────────────────────────────────────────── */}
                <div className="px-4 py-1.5 border-t border-slate-50 bg-slate-50/60 flex items-center justify-between gap-4">
                    <span className="text-[11px] text-slate-400 hidden sm:block">
                        Tip: Gunakan toolbar di atas untuk memformat teks, sisipkan gambar, atau tambahkan tautan.
                    </span>
                    <span className="text-[11px] text-slate-400 ml-auto tabular-nums">
                        {editor.getText().length} karakter
                    </span>
                </div>
            </div>
        </>
    );
}
