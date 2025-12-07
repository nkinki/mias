import React, { useState } from 'react';
import { generateCv } from '../../services/geminiService';
import type { CvData, CvWorkExperience, CvEducation } from '../../types';
import { Wand2, PlusCircle, Trash2, Clipboard, Download, User, Briefcase, GraduationCap, Wrench, FileText } from 'lucide-react';

// This global is loaded from a CDN in index.html
declare const saveAs: any;

// Sub-components for form sections
const FormSection: React.FC<{ title: string; icon: React.ReactNode; children: React.ReactNode }> = ({ title, icon, children }) => (
    <details open className="p-4 bg-surface border border-medium rounded-lg transition-all duration-300">
        <summary className="font-semibold text-lg text-dark flex items-center gap-3 cursor-pointer list-none">
            <span className="text-accent">{icon}</span>
            {title}
        </summary>
        <div className="mt-4 pt-4 border-t border-medium space-y-4">
            {children}
        </div>
    </details>
);

const InputField: React.FC<{ name: string; label: string; value: string; onChange: (e: React.ChangeEvent<HTMLInputElement>) => void; placeholder?: string; type?: string; required?: boolean }> = ({ label, ...props }) => (
    <div>
        <label htmlFor={props.name} className="block text-sm font-medium text-muted">{label}</label>
        <input id={props.name} {...props} className="mt-1 block w-full bg-light text-dark rounded-md px-3 py-2 border border-medium focus:outline-none focus:ring-2 focus:ring-accent" />
    </div>
);

const TextareaField: React.FC<{ name: string; label: string; value: string; onChange: (e: React.ChangeEvent<HTMLTextAreaElement>) => void; placeholder?: string; rows?: number; required?: boolean }> = ({ label, ...props }) => (
    <div>
        <label htmlFor={props.name} className="block text-sm font-medium text-muted">{label}</label>
        <textarea id={props.name} {...props} className="mt-1 block w-full bg-light text-dark rounded-md px-3 py-2 border border-medium focus:outline-none focus:ring-2 focus:ring-accent" />
    </div>
);

export const CvBuilder: React.FC = () => {
    // State for all form fields
    const [personalDetails, setPersonalDetails] = useState({ fullName: '', email: '', phone: '', linkedin: '' });
    const [summary, setSummary] = useState('');
    const [workExperience, setWorkExperience] = useState<CvWorkExperience[]>([{ jobTitle: '', company: '', location: '', startDate: '', endDate: '', description: '' }]);
    const [education, setEducation] = useState<CvEducation[]>([{ degree: '', institution: '', graduationDate: '' }]);
    const [skills, setSkills] = useState('');

    const [generatedCv, setGeneratedCv] = useState('');
    const [isLoading, setIsLoading] = useState(false);
    const [error, setError] = useState('');
    const [copySuccess, setCopySuccess] = useState('');

    // Handlers for dynamic lists
    const handleAddExperience = () => setWorkExperience([...workExperience, { jobTitle: '', company: '', location: '', startDate: '', endDate: '', description: '' }]);
    const handleRemoveExperience = (index: number) => setWorkExperience(workExperience.filter((_, i) => i !== index));
    const handleExperienceChange = (index: number, e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
        const { name, value } = e.target;
        const list = [...workExperience];
        (list[index] as any)[name] = value;
        setWorkExperience(list);
    };

    const handleAddEducation = () => setEducation([...education, { degree: '', institution: '', graduationDate: '' }]);
    const handleRemoveEducation = (index: number) => setEducation(education.filter((_, i) => i !== index));
    const handleEducationChange = (index: number, e: React.ChangeEvent<HTMLInputElement>) => {
        const { name, value } = e.target;
        const list = [...education];
        (list[index] as any)[name] = value;
        setEducation(list);
    };

    const handleGenerate = async () => {
        if (!personalDetails.fullName || !personalDetails.email) {
            setError('A Név és Email megadása kötelező.');
            window.scrollTo({ top: 0, behavior: 'smooth' });
            return;
        }
        
        setIsLoading(true);
        setError('');
        setGeneratedCv('');
        setCopySuccess('');

        const cvData: CvData = {
            ...personalDetails,
            summary,
            workExperience,
            education,
            skills,
        };

        try {
            const result = await generateCv(cvData);
            setGeneratedCv(result);
        } catch (err: any) {
            setError(err.message || 'Hiba történt az önéletrajz generálása közben.');
        } finally {
            setIsLoading(false);
        }
    };
    
    const handleCopy = () => {
        navigator.clipboard.writeText(generatedCv).then(() => {
            setCopySuccess('Önéletrajz a vágólapra másolva!');
            setTimeout(() => setCopySuccess(''), 2000);
        }, () => {
            setCopySuccess('A másolás sikertelen.');
        });
    };

    const handleDownload = () => {
        const blob = new Blob([generatedCv], { type: 'text/plain;charset=utf-8' });
        saveAs(blob, `oneletrajz_${personalDetails.fullName.replace(/\s/g, '_')}.txt`);
    };


    return (
        <div className="space-y-6">
            <h2 className="text-xl font-semibold text-center text-dark">Adja meg adatait az önéletrajz elkészítéséhez</h2>
            {error && <div className="text-red-500 text-center p-2 bg-red-50 border border-red-200 rounded">{error}</div>}
            
            <FormSection title="Személyes Adatok" icon={<User />}>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <InputField name="fullName" label="Teljes Név" value={personalDetails.fullName} onChange={e => setPersonalDetails({...personalDetails, fullName: e.target.value})} placeholder="Minta János" required />
                    <InputField name="email" label="Email Cím" type="email" value={personalDetails.email} onChange={e => setPersonalDetails({...personalDetails, email: e.target.value})} placeholder="minta.janos@email.com" required />
                    <InputField name="phone" label="Telefonszám" type="tel" value={personalDetails.phone} onChange={e => setPersonalDetails({...personalDetails, phone: e.target.value})} placeholder="+36 30 123 4567" />
                    <InputField name="linkedin" label="LinkedIn Profil (URL)" value={personalDetails.linkedin} onChange={e => setPersonalDetails({...personalDetails, linkedin: e.target.value})} placeholder="https://linkedin.com/in/mintajanos" />
                </div>
            </FormSection>

            <FormSection title="Szakmai Összegzés" icon={<FileText />}>
                <TextareaField name="summary" label="Rövid leírás vagy kulcsszavak" value={summary} onChange={e => setSummary(e.target.value)} placeholder="pl., Senior szoftverfejlesztő 5+ év tapasztalattal a React és Node.js területén. Célom, hogy..." rows={4} />
            </FormSection>

            <FormSection title="Szakmai Tapasztalat" icon={<Briefcase />}>
                {workExperience.map((exp, index) => (
                    <div key={index} className="p-3 bg-light border border-medium rounded-md space-y-3 relative">
                         <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                            <InputField name="jobTitle" label="Pozíció" value={exp.jobTitle} onChange={e => handleExperienceChange(index, e)} placeholder="Szoftverfejlesztő" />
                            <InputField name="company" label="Cég" value={exp.company} onChange={e => handleExperienceChange(index, e)} placeholder="Tech Kft." />
                            <InputField name="location" label="Helyszín" value={exp.location} onChange={e => handleExperienceChange(index, e)} placeholder="Budapest" />
                            <div className="grid grid-cols-2 gap-2">
                                <InputField name="startDate" label="Kezdés" type="text" value={exp.startDate} onChange={e => handleExperienceChange(index, e)} placeholder="2020. január" />
                                <InputField name="endDate" label="Befejezés" type="text" value={exp.endDate} onChange={e => handleExperienceChange(index, e)} placeholder="Jelenleg" />
                            </div>
                        </div>
                        <TextareaField name="description" label="Feladatok és eredmények (vázlatpontosan)" value={exp.description} onChange={e => handleExperienceChange(index, e)} placeholder="- Új funkciók fejlesztése a cég termékébe&#10;- A rendszer teljesítményének 20%-os javítása" rows={4} />

                        {workExperience.length > 1 && (
                            <button onClick={() => handleRemoveExperience(index)} className="absolute top-2 right-2 text-muted hover:text-red-500">
                                <Trash2 size={18} />
                            </button>
                        )}
                    </div>
                ))}
                <button onClick={handleAddExperience} className="flex items-center gap-2 text-accent font-semibold hover:underline">
                    <PlusCircle size={18} /> Új munkahely hozzáadása
                </button>
            </FormSection>
            
            <FormSection title="Tanulmányok" icon={<GraduationCap />}>
                {education.map((edu, index) => (
                    <div key={index} className="p-3 bg-light border border-medium rounded-md space-y-3 relative">
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                             <InputField name="degree" label="Végzettség / Szak" value={edu.degree} onChange={e => handleEducationChange(index, e)} placeholder="Mérnökinformatikus BSc" />
                             <InputField name="institution" label="Intézmény" value={edu.institution} onChange={e => handleEducationChange(index, e)} placeholder="Műszaki Egyetem" />
                             <InputField name="graduationDate" label="Befejezés dátuma" type="text" value={edu.graduationDate} onChange={e => handleEducationChange(index, e)} placeholder="2020" />
                        </div>
                        {education.length > 1 && (
                            <button onClick={() => handleRemoveEducation(index)} className="absolute top-2 right-2 text-muted hover:text-red-500">
                                <Trash2 size={18} />
                            </button>
                        )}
                    </div>
                ))}
                 <button onClick={handleAddEducation} className="flex items-center gap-2 text-accent font-semibold hover:underline">
                    <PlusCircle size={18} /> Új tanulmány hozzáadása
                </button>
            </FormSection>

            <FormSection title="Készségek" icon={<Wrench />}>
                <TextareaField name="skills" label="Készségek (vesszővel elválasztva)" value={skills} onChange={e => setSkills(e.target.value)} placeholder="React, JavaScript, Python, Angol (felsőfok), Csapatmunka" rows={4} />
            </FormSection>

            <button
                onClick={handleGenerate}
                disabled={isLoading}
                className="w-full flex items-center justify-center gap-2 bg-accent hover:bg-accent-hover text-white font-bold py-3 px-4 rounded-md transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
            >
                {isLoading ? 'Generálás...' : (
                    <>
                        <Wand2 size={20}/>
                        <span>Önéletrajz Létrehozása</span>
                    </>
                )}
            </button>
            
            {isLoading && <div className="text-center p-8">Önéletrajz összeállítása...</div>}
            
            {generatedCv && (
                 <div className="space-y-4">
                    <div className="flex justify-between items-center">
                        <h3 className="font-semibold text-2xl text-dark">Elkészült Önéletrajz</h3>
                        <div className="flex gap-2">
                             <button onClick={handleCopy} title="Másolás vágólapra" className="flex items-center gap-2 bg-gray-200 px-3 py-1 rounded text-dark hover:bg-gray-300 transition-colors">
                                <Clipboard size={16}/>
                            </button>
                             <button onClick={handleDownload} title="Letöltés .txt fájlként" className="flex items-center gap-2 bg-gray-200 px-3 py-1 rounded text-dark hover:bg-gray-300 transition-colors">
                                <Download size={16}/>
                            </button>
                        </div>
                    </div>
                    {copySuccess && <p className="text-green-600 text-sm mb-2" role="status">{copySuccess}</p>}
                    <textarea
                        readOnly
                        value={generatedCv}
                        rows={20}
                        className="w-full p-4 bg-surface text-dark rounded-md border border-medium font-sans whitespace-pre-wrap leading-relaxed"
                        aria-label="Generált önéletrajz"
                    />
                </div>
            )}
        </div>
    );
};
