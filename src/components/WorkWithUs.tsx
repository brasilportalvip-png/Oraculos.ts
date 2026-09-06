import React, { useState, useRef } from 'react';
import { BriefcaseBusiness, CheckCircle2, Upload, Camera, Trash2, Image as ImageIcon, Loader2 } from 'lucide-react';

const ORACLES = ['tarot', 'cigano', 'astrologia', 'numerologia', 'buzios', 'ifa', 'runas', 'iching', 'cristais', 'mesaradionica'];

export const WorkWithUs: React.FC = () => {
  const [form, setForm] = useState({
    fullName: '', professionalName: '', email: '', phone: '', city: '', state: '',
    bio: '', experienceYears: '1', profilePhoto: '', modality: 'chat', oracles: [] as string[],
    termsAccepted: false,
  });
  const [loading, setLoading] = useState(false);
  const [uploadingImage, setUploadingImage] = useState(false);
  const [uploadError, setUploadError] = useState('');
  const [showUrlInput, setShowUrlInput] = useState(false);
  const [message, setMessage] = useState('');
  const [success, setSuccess] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);

  /**
   * Redimensiona e otimiza a imagem no próprio navegador do usuário (celular ou notebook)
   * antes do envio, garantindo upload rápido e sem travar mesmo em conexões lentas móveis.
   */
  const processAndUploadFile = async (file: File) => {
    if (!file.type.startsWith('image/')) {
      setUploadError('Por favor selecione um arquivo de imagem válido (JPG, PNG, WEBP).');
      return;
    }
    setUploadingImage(true);
    setUploadError('');

    try {
      const dataUrl = await new Promise<string>((resolve, reject) => {
        const reader = new FileReader();
        reader.onload = () => {
          const img = new Image();
          img.onload = () => {
            const canvas = document.createElement('canvas');
            const maxDim = 800;
            let width = img.width;
            let height = img.height;
            if (width > height && width > maxDim) {
              height = Math.round((height * maxDim) / width);
              width = maxDim;
            } else if (height > maxDim) {
              width = Math.round((width * maxDim) / height);
              height = maxDim;
            }
            canvas.width = width;
            canvas.height = height;
            const ctx = canvas.getContext('2d');
            if (!ctx) {
              resolve(reader.result as string);
              return;
            }
            ctx.drawImage(img, 0, 0, width, height);
            resolve(canvas.toDataURL('image/jpeg', 0.88));
          };
          img.onerror = () => reject(new Error('Não foi possível ler a imagem selecionada.'));
          img.src = reader.result as string;
        };
        reader.onerror = () => reject(new Error('Erro ao ler arquivo do dispositivo.'));
        reader.readAsDataURL(file);
      });

      // Envia ao servidor para persistir arquivo em /uploads/
      const res = await fetch('/api/work-with-us/upload-photo', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ image: dataUrl }),
      });

      const json = await res.json().catch(() => ({}));
      if (res.ok && json.url) {
        setForm((prev) => ({ ...prev, profilePhoto: json.url }));
      } else {
        // Fallback: utiliza o próprio dataUrl otimizado
        setForm((prev) => ({ ...prev, profilePhoto: dataUrl }));
      }
    } catch (err) {
      console.error('Falha ao processar foto:', err);
      setUploadError(err instanceof Error ? err.message : 'Falha ao processar foto do celular/computador.');
    } finally {
      setUploadingImage(false);
    }
  };

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      void processAndUploadFile(file);
    }
  };

  const submit = async (event: React.FormEvent) => {
    event.preventDefault();
    setLoading(true);
    setMessage('');
    try {
      const response = await fetch('/api/work-with-us/applications', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          ...form,
          experienceYears: Number(form.experienceYears),
          specialties: form.oracles,
          languages: ['Português'],
        }),
      });
      const body = await response.json().catch(() => ({}));
      if (!response.ok || !body.success) throw new Error(body.error?.message || 'Não foi possível enviar a candidatura.');
      setSuccess(true);
      setMessage('Candidatura enviada. A administração analisará seus dados antes da publicação no marketplace.');
    } catch (error) {
      setMessage(error instanceof Error ? error.message : 'Falha ao enviar candidatura.');
    } finally {
      setLoading(false);
    }
  };

  if (success) {
    return (
      <section className="max-w-2xl mx-auto py-20 text-center space-y-5">
        <CheckCircle2 className="w-16 h-16 mx-auto text-emerald-400" />
        <h1 className="text-3xl font-black text-amber-200">Cadastro recebido</h1>
        <p className="text-slate-300">{message}</p>
      </section>
    );
  }

  const inputClass = 'w-full px-4 py-3 rounded-xl bg-[#150F26] border border-purple-800/60 text-white focus:border-amber-400 outline-none';
  return (
    <section className="max-w-3xl mx-auto py-10 space-y-8">
      <header className="text-center space-y-3">
        <BriefcaseBusiness className="w-12 h-12 mx-auto text-amber-400" />
        <h1 className="text-3xl font-black text-amber-200">Trabalhe Conosco</h1>
        <p className="text-slate-300">Cadastre-se como profissional. Seu perfil somente será publicado após aprovação administrativa.</p>
      </header>
      <form onSubmit={submit} className="p-6 md:p-8 rounded-3xl bg-[#0f0b1b] border border-purple-900/60 grid md:grid-cols-2 gap-4">
        <input required className={inputClass} placeholder="Nome completo" value={form.fullName} onChange={(e) => setForm({ ...form, fullName: e.target.value })} />
        <input required className={inputClass} placeholder="Nome profissional" value={form.professionalName} onChange={(e) => setForm({ ...form, professionalName: e.target.value })} />
        <input required type="email" className={inputClass} placeholder="E-mail" value={form.email} onChange={(e) => setForm({ ...form, email: e.target.value })} />
        <input required className={inputClass} placeholder="Telefone/WhatsApp" value={form.phone} onChange={(e) => setForm({ ...form, phone: e.target.value })} />
        <input required className={inputClass} placeholder="Cidade" value={form.city} onChange={(e) => setForm({ ...form, city: e.target.value })} />
        <input required className={inputClass} placeholder="Estado" value={form.state} onChange={(e) => setForm({ ...form, state: e.target.value })} />
        <input required type="number" min="0" max="80" className={inputClass} placeholder="Anos de experiência" value={form.experienceYears} onChange={(e) => setForm({ ...form, experienceYears: e.target.value })} />
        <select className={inputClass} value={form.modality} onChange={(e) => setForm({ ...form, modality: e.target.value })}>
          <option value="chat">Chat Seguro</option>
        </select>

        {/* Upload de Foto pelo Celular ou Notebook */}
        <div className="md:col-span-2 space-y-2">
          <label className="block text-sm font-bold text-amber-200">
            Foto de Perfil Profissional
          </label>
          <div className="p-4 rounded-2xl bg-[#150F26] border border-purple-800/60 flex flex-col sm:flex-row items-center gap-4">
            {form.profilePhoto ? (
              <div className="relative group shrink-0">
                <img
                  src={form.profilePhoto}
                  alt="Foto do candidato"
                  className="w-20 h-20 rounded-2xl object-cover border-2 border-amber-400/50 shadow-md"
                />
                <button
                  type="button"
                  onClick={() => setForm((prev) => ({ ...prev, profilePhoto: '' }))}
                  className="absolute -top-2 -right-2 p-1.5 rounded-full bg-rose-600 text-white shadow-lg hover:bg-rose-500 transition-colors"
                  title="Remover foto"
                >
                  <Trash2 className="w-3.5 h-3.5" />
                </button>
              </div>
            ) : (
              <div className="w-20 h-20 rounded-2xl bg-purple-950/40 border border-dashed border-purple-600/60 flex items-center justify-center shrink-0 text-purple-400">
                <Camera className="w-8 h-8" />
              </div>
            )}

            <div className="flex-1 text-center sm:text-left space-y-2">
              <input
                ref={fileInputRef}
                type="file"
                accept="image/*"
                className="hidden"
                onChange={handleFileChange}
              />
              <div className="flex flex-wrap items-center justify-center sm:justify-start gap-2">
                <button
                  type="button"
                  disabled={uploadingImage}
                  onClick={() => fileInputRef.current?.click()}
                  className="px-4 py-2.5 rounded-xl bg-purple-600/30 hover:bg-purple-600/50 border border-purple-500/40 text-purple-200 text-xs font-bold flex items-center gap-2 transition-colors disabled:opacity-50"
                >
                  {uploadingImage ? (
                    <>
                      <Loader2 className="w-4 h-4 animate-spin text-amber-400" />
                      Carregando imagem...
                    </>
                  ) : (
                    <>
                      <Upload className="w-4 h-4 text-amber-400" />
                      {form.profilePhoto ? 'Trocar foto do celular/notebook' : 'Carregar foto do celular ou notebook'}
                    </>
                  )}
                </button>
                <button
                  type="button"
                  onClick={() => setShowUrlInput(!showUrlInput)}
                  className="text-xs text-purple-400 hover:text-amber-300 underline underline-offset-4"
                >
                  {showUrlInput ? 'Ocultar campo de link' : 'Ou colar link direto da foto'}
                </button>
              </div>
              <p className="text-[11px] text-slate-400">
                Formatos aceitos: JPG, PNG, WEBP. A foto é otimizada automaticamente para seu perfil.
              </p>
              {uploadError && <p className="text-xs text-rose-300">{uploadError}</p>}
            </div>
          </div>

          {showUrlInput && (
            <input
              type="url"
              className={inputClass}
              placeholder="https://exemplo.com/sua-foto.jpg"
              value={form.profilePhoto}
              onChange={(e) => setForm({ ...form, profilePhoto: e.target.value })}
            />
          )}
        </div>

        <textarea required minLength={40} rows={5} className={`${inputClass} md:col-span-2`} placeholder="Conte sua experiência, formação e forma de atendimento" value={form.bio} onChange={(e) => setForm({ ...form, bio: e.target.value })} />
        <fieldset className="md:col-span-2 space-y-3">
          <legend className="text-sm font-bold text-amber-200">Oráculos atendidos</legend>
          <div className="grid grid-cols-2 sm:grid-cols-3 gap-2">
            {ORACLES.map((oracle) => (
              <label key={oracle} className="flex gap-2 items-center text-sm text-slate-300 capitalize">
                <input type="checkbox" checked={form.oracles.includes(oracle)} onChange={() => setForm({ ...form, oracles: form.oracles.includes(oracle) ? form.oracles.filter((item) => item !== oracle) : [...form.oracles, oracle] })} />
                {oracle}
              </label>
            ))}
          </div>
        </fieldset>
        <label className="md:col-span-2 flex gap-3 text-sm text-slate-300">
          <input required type="checkbox" checked={form.termsAccepted} onChange={(e) => setForm({ ...form, termsAccepted: e.target.checked })} />
          Confirmo que os dados são verdadeiros e aceito a análise administrativa e as regras da plataforma.
        </label>
        {message && <p role="alert" className="md:col-span-2 text-sm text-rose-300">{message}</p>}
        <button disabled={loading || form.oracles.length === 0} className="md:col-span-2 py-3 rounded-xl bg-amber-400 text-black font-black disabled:opacity-50">
          {loading ? 'Enviando...' : 'Enviar candidatura'}
        </button>
      </form>
    </section>
  );
};
