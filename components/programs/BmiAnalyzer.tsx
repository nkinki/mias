import React, { useState } from 'react';
import { processText } from '../../services/geminiService';
import { Zap } from 'lucide-react';

type Gender = 'male' | 'female';

const getBmiCategory = (bmi: number): { category: string; color: string } => {
    if (bmi < 18.5) return { category: 'Sovány', color: 'text-blue-500' };
    if (bmi < 25) return { category: 'Normál', color: 'text-green-500' };
    if (bmi < 30) return { category: 'Túlsúlyos', color: 'text-yellow-500' };
    if (bmi < 35) return { category: 'Elhízott', color: 'text-orange-500' };
    return { category: 'Súlyosan elhízott', color: 'text-red-500' };
};

export const BmiAnalyzer: React.FC = () => {
    const [height, setHeight] = useState('');
    const [weight, setWeight] = useState('');
    const [age, setAge] = useState('');
    const [gender, setGender] = useState<Gender | null>(null);
    const [result, setResult] = useState<{ bmi: number; analysis: string } | null>(null);
    const [isLoading, setIsLoading] = useState(false);
    const [error, setError] = useState('');

    const handleCalculate = async () => {
        const heightNum = parseFloat(height);
        const weightNum = parseFloat(weight);
        const ageNum = parseInt(age, 10);

        if (!gender || !heightNum || !weightNum || !ageNum || heightNum <= 0 || weightNum <= 0 || ageNum <=0) {
            setError('Kérjük, adjon meg érvényes, pozitív értékeket minden mezőhöz.');
            setResult(null);
            return;
        }

        setError('');
        setIsLoading(true);
        setResult(null);

        try {
            const heightInMeters = heightNum / 100;
            const bmi = weightNum / (heightInMeters * heightInMeters);
            const roundedBmi = parseFloat(bmi.toFixed(1));

            const genderText = gender === 'male' ? 'férfi' : 'nő';

            const prompt = `
                Készíts egy részletes, barátságos hangvételű elemzést egy személy testtömegindex (BMI) eredményéről. Az elemzés legyen informatív és adjon hasznos tanácsokat, de hangsúlyozd, hogy nem minősül orvosi tanácsadásnak.

                Adatok:
                - Életkor: ${ageNum} év
                - Magasság: ${heightNum} cm
                - Súly: ${weightNum} kg
                - Nem: ${genderText}
                - Kiszámított BMI: ${roundedBmi}

                Az elemzésnek a következő részeket kell tartalmaznia, figyelembe véve az életkort (${ageNum} év):
                1.  **Összegzés:** Egy rövid, érthető megállapítás a BMI értékéről.
                2.  **A BMI érték jelentése:** Magyarázd el, mit jelent a ${roundedBmi} BMI érték a WHO kategóriák (sovány, normál, túlsúlyos, elhízott) alapján. Értelmezd az eredményt az életkor kontextusában is, megemlítve, hogy az ideális tartomány változhat az életkorral. Fiatalok (20 év alatt) esetén jelezd, hogy a percentilis görbék használata pontosabb.
                3.  **Személyre szabott javaslatok:** Adj konkrét, gyakorlatias életmódbeli tanácsokat a nem (${genderText}), a BMI kategória és az életkor (${ageNum} év) alapján. A tanácsok legyenek életkor-specifikusak (pl. más mozgásforma javasolt egy fiatalnak, mint egy idősebbnek).
                4.  **Fontos figyelmeztetés:** Egy rövid, egyértelmű mondat arról, hogy az elemzés tájékoztató jellegű és nem helyettesíti a szakorvosi vizsgálatot. Minden esetben javasolj konzultációt orvossal vagy dietetikussal.

                A hangnem legyen támogató és objektív.
            `;
            
            const analysisText = await processText(prompt, '');
            setResult({ bmi: roundedBmi, analysis: analysisText });

        } catch (err: any) {
            setError('Hiba történt az elemzés generálása során. Kérjük, próbálja újra.');
            console.error(err);
        } finally {
            setIsLoading(false);
        }
    };
    
    const bmiInfo = result ? getBmiCategory(result.bmi) : null;

    return (
        <div className="space-y-6">
            <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-4 gap-4 p-4 bg-light border border-medium rounded-lg">
                {/* Inputs */}
                <div>
                    <label htmlFor="height" className="block mb-1 font-semibold text-dark">Magasság (cm)</label>
                    <input
                        id="height"
                        type="number"
                        value={height}
                        onChange={(e) => setHeight(e.target.value)}
                        placeholder="pl. 175"
                        min="1"
                        className="w-full bg-surface text-dark placeholder-muted rounded-md px-3 py-2 border border-medium focus:outline-none focus:ring-2 focus:ring-accent"
                    />
                </div>
                <div>
                    <label htmlFor="weight" className="block mb-1 font-semibold text-dark">Testsúly (kg)</label>
                    <input
                        id="weight"
                        type="number"
                        value={weight}
                        onChange={(e) => setWeight(e.target.value)}
                        placeholder="pl. 70"
                        min="1"
                        className="w-full bg-surface text-dark placeholder-muted rounded-md px-3 py-2 border border-medium focus:outline-none focus:ring-2 focus:ring-accent"
                    />
                </div>
                <div>
                    <label htmlFor="age" className="block mb-1 font-semibold text-dark">Életkor</label>
                    <input
                        id="age"
                        type="number"
                        value={age}
                        onChange={(e) => setAge(e.target.value)}
                        placeholder="pl. 35"
                        min="1"
                        className="w-full bg-surface text-dark placeholder-muted rounded-md px-3 py-2 border border-medium focus:outline-none focus:ring-2 focus:ring-accent"
                    />
                </div>
                <div>
                    <label className="block mb-1 font-semibold text-dark">Nem</label>
                    <div className="flex gap-2 h-10">
                        <button
                            onClick={() => setGender('male')}
                            className={`w-1/2 rounded-md font-semibold transition-colors border ${gender === 'male' ? 'bg-accent text-white border-accent' : 'bg-surface text-dark border-medium hover:bg-gray-100'}`}
                        >
                            Férfi
                        </button>
                        <button
                            onClick={() => setGender('female')}
                            className={`w-1/2 rounded-md font-semibold transition-colors border ${gender === 'female' ? 'bg-accent text-white border-accent' : 'bg-surface text-dark border-medium hover:bg-gray-100'}`}
                        >
                            Nő
                        </button>
                    </div>
                </div>
            </div>

            <button
                onClick={handleCalculate}
                disabled={isLoading || !height || !weight || !gender || !age}
                className="w-full flex items-center justify-center gap-2 bg-accent hover:bg-accent-hover text-white font-bold py-3 px-4 rounded-md transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
            >
                {isLoading ? 'Számítás...' : (
                    <>
                        <Zap size={20} />
                        <span>Analízis Indítása</span>
                    </>
                )}
            </button>

            {error && <div className="text-red-500 text-center" role="alert">{error}</div>}

            {isLoading && <div className="text-center p-8">Elemzés folyamatban...</div>}

            {result && bmiInfo && (
                <div className="space-y-4">
                    <div className="text-center p-6 bg-surface rounded-lg border border-medium">
                        <h3 className="font-semibold text-lg text-muted">Testtömeg Index (BMI)</h3>
                        <p className={`text-7xl font-bold my-2 ${bmiInfo.color}`}>
                            {result.bmi}
                        </p>
                        <p className={`text-2xl font-semibold ${bmiInfo.color}`}>{bmiInfo.category}</p>
                    </div>
                    <div>
                        <h3 className="font-semibold text-2xl text-dark mb-2">Részletes Elemzés</h3>
                        <div className="p-4 bg-surface text-dark rounded-md border border-medium whitespace-pre-wrap font-sans leading-relaxed">
                            {result.analysis}
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
};