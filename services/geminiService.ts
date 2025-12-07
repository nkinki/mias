
import { GoogleGenAI, GenerateContentResponse, Chat, Type, Modality } from "@google/genai";
// Fix: Import EcgAnalysis and Presentation to be used in the new analyzeEcg and generatePresentation functions.
import type { GroundedResponse, GroundingSource, LabReportAnalysis, CvData, EcgAnalysis, Presentation } from '../types';

if (!process.env.API_KEY) {
  throw new Error("Az API_KEY környezeti változó nincs beállítva");
}

const ai = new GoogleGenAI({ apiKey: process.env.API_KEY });
let chatInstance: Chat | null = null;

const fileToGenerativePart = (base64: string, mimeType: string) => {
  return {
    inlineData: {
      data: base64,
      mimeType
    },
  };
};

export const analyzeImage = async (base64Image: string, mimeType: string, prompt: string): Promise<string> => {
  const imagePart = fileToGenerativePart(base64Image, mimeType);
  try {
    const response: GenerateContentResponse = await ai.models.generateContent({
        model: 'gemini-2.5-flash',
        contents: { parts: [imagePart, { text: prompt }] },
    });
    return response.text;
  } catch (error) {
    console.error("Hiba a kép elemzésekor:", error);
    return "Hiba: A kép elemzése nem sikerült.";
  }
};

export const editImage = async (base64Image: string, mimeType: string, prompt: string): Promise<string> => {
  try {
    const response = await ai.models.generateContent({
      model: 'gemini-2.5-flash-image',
      contents: {
        parts: [
          {
            inlineData: {
              data: base64Image,
              mimeType: mimeType,
            },
          },
          {
            text: prompt,
          },
        ],
      },
      config: {
          responseModalities: [Modality.IMAGE, Modality.TEXT],
      },
    });

    if (!response.candidates?.length || !response.candidates[0].content?.parts) {
        throw new Error("Érvénytelen válasz érkezett a modelltől.");
    }
    
    const imagePart = response.candidates[0].content.parts.find(part => !!part.inlineData);

    if (imagePart?.inlineData) {
        return imagePart.inlineData.data;
    }
    
    const textContent = response.text;
    if (textContent) {
        throw new Error(`A modell nem adott vissza képet. Helyette a következő üzenetet küldte: "${textContent}"`);
    }

    throw new Error("A modell nem adott vissza képet, és nem adott szöveges magyarázatot sem.");
  } catch (error) {
    console.error("Hiba a kép szerkesztésekor:", error);
    if (error instanceof Error) {
        throw new Error(error.message);
    }
    throw new Error("A kép szerkesztése nem sikerült. Kérjük, próbálja újra később.");
  }
};


export const extractTextFromImage = async (base64Image: string, mimeType: string): Promise<string> => {
  const prompt = "Nyerj ki minden szöveget ebből a képből. Csak a szöveges tartalmat add vissza.";
  return analyzeImage(base64Image, mimeType, prompt);
};

export const extractTableFromImageAsJson = async (base64Image: string, mimeType: string): Promise<string> => {
    const prompt = "Elemezd a táblázatot ezen a képen. A tartalmát add vissza érvényes JSON objektumok tömbjeként, ahol minden objektum egy sort képvisel. Az objektumok kulcsai legyenek az oszlopfejlécek. Ne tartalmazzon semmilyen más szöveget vagy magyarázatot, csak a nyers JSON-t.";
    try {
        const response = await ai.models.generateContent({
            model: 'gemini-2.5-flash',
            contents: {
                parts: [
                    fileToGenerativePart(base64Image, mimeType),
                    { text: prompt }
                ]
            },
            config: {
                responseMimeType: "application/json",
            }
        });
        return response.text;
    } catch (error) {
        console.error("Hiba a táblázat kinyerésekor:", error);
        return "[]";
    }
};

export const transcribeAudio = async (base64Audio: string, mimeType: string): Promise<string> => {
  const audioPart = fileToGenerativePart(base64Audio, mimeType);
  const prompt = "Írd át a hangfelvételt. Csak a hanganyagból származó szöveget add vissza.";
  try {
    const response: GenerateContentResponse = await ai.models.generateContent({
        model: 'gemini-2.5-flash',
        contents: { parts: [audioPart, { text: prompt }] },
    });
    return response.text;
  } catch (error) {
    console.error("Hiba az audio átírásakor:", error);
    return "Hiba: Az audiofájl átírása nem sikerült.";
  }
};

export const processText = async (text: string, prompt: string): Promise<string> => {
    try {
        const response = await ai.models.generateContent({
            model: 'gemini-2.5-flash',
            contents: `${prompt}\n\n---\n\n${text}`,
        });
        return response.text;
    } catch (error) {
        console.error("Hiba a szöveg feldolgozásakor:", error);
        return "Hiba: A szöveg feldolgozása nem sikerült.";
    }
};

export const analyzeLabReport = async (fileData: { base64: string, mimeType: string } | { text: string }, userQuestion: string): Promise<LabReportAnalysis> => {
    const disclaimer = `***FIGYELEM: Ez az elemzés mesterséges intelligencia által generált, és kizárólag tájékoztató jellegű. NEM minősül orvosi tanácsadásnak. Az eredmények értelmezéséért és bármilyen egészségügyi döntés meghozataláért MINDIG konzultáljon kezelőorvosával!***`;

    const prompt = `Viselkedj MI-asszisztensként, amely segít a felhasználóknak megérteni az egészségügyi laborleleteiket. A célod, hogy közérthető magyarázatokat adj, kizárólag tájékoztatási céllal. A válaszodnak strukturált JSON formátumúnak kell lennie a megadott séma szerint.

**Feladat:**
Elemezd a megadott laborleletet (kép vagy szöveg) és a felhasználó kérdését. Adj részletes, közérthető magyarázatot **MINDEN** leletben szereplő tételre.

**A JSON struktúra elemei:**
1.  **disclaimer:** Mindig ezt az értéket add vissza: "${disclaimer}"
2.  **summary:** Írj egy rövid, 2-3 mondatos általános összefoglalót a lelet legfontosabb megállapításairól.
3.  **results (tömb):** Listázd ki a leletben szereplő **ÖSSZES** tételt. Minden tételhez a következőket add meg:
    *   **testName:** A vizsgálat neve (pl. "Koleszterin").
    *   **value:** A mért érték (pl. "5.2 mmol/L").
    *   **referenceRange:** A normál referenciatartomány (pl. "< 5.2 mmol/L").
    *   **status:** Az érték állapota. Lehetséges értékek: 'normal' (ha az érték a referenciatartományon belül van), 'high' (ha magasabb), 'low' (ha alacsonyabb), 'abnormal' (ha eltér, de nem egyértelműen magas/alacsony), 'information' (ha nincs referenciaérték, pl. vércsoport).
    *   **explanation:** Részletes, közérthető magyarázat arról, hogy mit mér az adott érték, és mit jelent az eredmény a páciens számára.
4.  **recommendations:** A lelet egésze alapján adj általános, nem gyógyszeres életmódbeli tanácsokat (diéta, testmozgás, stb.).
5.  **userQuestionAnswer:** Válaszold meg a felhasználó konkrét kérdését a lelet alapján. Ha nincs kérdés, hagyd üresen a stringet.

A felhasználó kérdése: "${userQuestion || 'Nincs konkrét kérdés.'}"

--- LABORLELET ADATOK ---
`;

    const contents: any = { parts: [] };

    if ('base64' in fileData) {
        contents.parts.push(fileToGenerativePart(fileData.base64, fileData.mimeType));
        contents.parts.push({ text: prompt });
    } else {
        contents.parts.push({ text: `${prompt}\n\n${fileData.text}` });
    }
    
    const responseSchema = {
        type: Type.OBJECT,
        properties: {
            disclaimer: { type: Type.STRING },
            summary: { type: Type.STRING },
            results: {
                type: Type.ARRAY,
                items: {
                    type: Type.OBJECT,
                    properties: {
                        testName: { type: Type.STRING },
                        value: { type: Type.STRING },
                        referenceRange: { type: Type.STRING },
                        status: { type: Type.STRING },
                        explanation: { type: Type.STRING }
                    },
                    required: ["testName", "value", "referenceRange", "status", "explanation"]
                }
            },
            recommendations: { type: Type.STRING },
            userQuestionAnswer: { type: Type.STRING }
        },
        required: ["disclaimer", "summary", "results", "recommendations", "userQuestionAnswer"]
    };

    try {
        const response: GenerateContentResponse = await ai.models.generateContent({
            model: 'gemini-2.5-flash',
            contents: contents,
            config: {
                responseMimeType: "application/json",
                responseSchema: responseSchema
            }
        });
        
        const jsonText = response.text.trim();
        const parsedData = JSON.parse(jsonText);

        // A `status` mező validálása, hogy biztosan a megengedett értékek egyike legyen
        parsedData.results.forEach((item: any) => {
            const validStatuses = ['normal', 'high', 'low', 'abnormal', 'information'];
            if (!validStatuses.includes(item.status)) {
                item.status = 'abnormal'; // Alapértelmezett érték, ha a modell mást adna vissza
            }
        });

        return parsedData;

    } catch (error) {
        console.error("Hiba a laborlelet elemzésekor (JSON feldolgozás):", error);
        throw new Error("Az MI által adott válasz formátuma hibás, vagy az elemzés nem sikerült. Próbálja újra egy jobb minőségű képpel vagy PDF-fel.");
    }
};

// Fix: Add analyzeEcg function to resolve import error in EcgAnalyzer.tsx.
export const analyzeEcg = async (base64Image: string, mimeType: string, userQuestion: string): Promise<EcgAnalysis> => {
    const disclaimer = `***FIGYELEM: Ez az elemzés mesterséges intelligencia által generált, és kizárólag oktatási és tájékoztató jellegű. NEM minősül orvosi diagnózisnak vagy tanácsadásnak. Az EKG-görbék szakszerű kiértékelése kizárólag kardiológus szakorvos feladata. SOHA ne hozzon egészségügyi döntést ezen elemzés alapján! MINDIG konzultáljon kezelőorvosával!***`;

    const prompt = `Viselkedj MI-asszisztensként, amely segít a felhasználóknak megérteni az EKG-leleteiket oktatási céllal. A célod, hogy közérthető magyarázatokat adj. A válaszodnak strukturált JSON formátumúnak kell lennie a megadott séma szerint. HANGSÚLYOZD MINDIG, HOGY EZ NEM ORVOSI DIAGNÓZIS.

**Feladat:**
Elemezd a megadott EKG-képet és a felhasználó kérdését. Adj részletes, közérthető magyarázatot a legfontosabb EKG paraméterekre.

**A JSON struktúra elemei:**
1.  **disclaimer:** Mindig ezt az értéket add vissza: "${disclaimer}"
2.  **overallImpression:** Írj egy rövid, 2-3 mondatos általános összefoglalót a lelet legfontosabb megállapításairól (pl. "Sinus ritmus, normál frekvenciával, jelentős eltérések nélkül.").
3.  **findings (tömb):** Listázd ki a legfontosabb EKG paramétereket. Minden tételhez a következőket add meg:
    *   **parameter:** A vizsgált paraméter (pl. "Ritmus", "Frekvencia", "PQ-távolság", "QRS-szélesség", "QT-távolság", "Tengelyállás", "ST-eleváció/depresszió").
    *   **value:** A mért vagy megfigyelt érték (pl. "Sinus", "75/perc", "160 ms", "90 ms", "400 ms", "Normál", "Nincs").
    *   **finding:** Az érték állapota. Lehetséges értékek: 'normal', 'borderline' (határérték), 'abnormal' (kóros), 'unclear' (nem egyértelműen megítélhető a kép alapján).
    *   **explanation:** Részletes, közérthető magyarázat arról, hogy mit jelent az adott paraméter és az eredmény.
4.  **recommendations:** A lelet egésze alapján adj általános tanácsokat (pl. "Az eredmények alapján javasolt kardiológiai konzultáció.").
5.  **userQuestionAnswer:** Válaszold meg a felhasználó konkrét kérdését a lelet alapján. Ha nincs kérdés, hagyd üresen a stringet.

A felhasználó kérdése: "${userQuestion || 'Nincs konkrét kérdés.'}"

--- EKG KÉP ---
`;

    const contents = {
        parts: [
            fileToGenerativePart(base64Image, mimeType),
            { text: prompt }
        ]
    };

    const responseSchema = {
        type: Type.OBJECT,
        properties: {
            disclaimer: { type: Type.STRING },
            overallImpression: { type: Type.STRING },
            findings: {
                type: Type.ARRAY,
                items: {
                    type: Type.OBJECT,
                    properties: {
                        parameter: { type: Type.STRING },
                        value: { type: Type.STRING },
                        finding: { type: Type.STRING },
                        explanation: { type: Type.STRING }
                    },
                    required: ["parameter", "value", "finding", "explanation"]
                }
            },
            recommendations: { type: Type.STRING },
            userQuestionAnswer: { type: Type.STRING }
        },
        required: ["disclaimer", "overallImpression", "findings", "recommendations", "userQuestionAnswer"]
    };

    try {
        const response: GenerateContentResponse = await ai.models.generateContent({
            model: 'gemini-2.5-flash',
            contents: contents,
            config: {
                responseMimeType: "application/json",
                responseSchema: responseSchema
            }
        });

        const jsonText = response.text.trim();
        const parsedData = JSON.parse(jsonText);

        // A `finding` mező validálása
        parsedData.findings.forEach((item: any) => {
            const validFindings = ['normal', 'borderline', 'abnormal', 'unclear'];
            if (!validFindings.includes(item.finding)) {
                item.finding = 'unclear'; // Alapértelmezett érték
            }
        });

        return parsedData;

    } catch (error) {
        console.error("Hiba az EKG elemzésekor (JSON feldogozás):", error);
        throw new Error("Az MI által adott válasz formátuma hibás, vagy az elemzés nem sikerült. Próbálja újra egy jobb minőségű képpel.");
    }
};

export const generateImageFromText = async (prompt: string): Promise<string> => {
  try {
    const response = await ai.models.generateImages({
      model: 'imagen-4.0-generate-001',
      prompt: prompt,
      config: {
        numberOfImages: 1,
        outputMimeType: 'image/png',
      },
    });
    const base64ImageBytes: string = response.generatedImages[0].image.imageBytes;
    return base64ImageBytes;
  } catch (error) {
    console.error("Hiba a kép generálásakor:", error);
    throw new Error("A kép generálása nem sikerült. Kérjük, próbálja újra később.");
  }
};

export const generateSpeech = async (text: string, voiceName: 'Kore' | 'Zephyr' | 'Puck' | 'Charon' | 'Fenrir'): Promise<string> => {
  try {
    const response = await ai.models.generateContent({
      model: "gemini-2.5-flash-preview-tts",
      contents: [{ parts: [{ text: text }] }],
      config: {
        responseModalities: [Modality.AUDIO],
        speechConfig: {
            voiceConfig: {
              prebuiltVoiceConfig: { voiceName: voiceName },
            },
        },
      },
    });
    const base64Audio = response.candidates?.[0]?.content?.parts?.[0]?.inlineData?.data;
    if (!base64Audio) {
      throw new Error("A modell nem adott vissza hanganyagot.");
    }
    return base64Audio;
  } catch (error) {
    console.error("Hiba a beszéd generálásakor:", error);
    throw new Error("A beszéd generálása nem sikerült.");
  }
};

export const generateVideo = async (prompt: string): Promise<any> => {
    try {
        const operation = await ai.models.generateVideos({
            model: 'veo-2.0-generate-001',
            prompt: prompt,
            config: {
                numberOfVideos: 1
            }
        });
        return operation;
    } catch (error) {
        console.error("Hiba a videógenerálás indításakor:", error);
        throw new Error("A videó generálásának indítása nem sikerült.");
    }
};

export const getVideosOperationStatus = async (operation: any): Promise<any> => {
    try {
        const updatedOperation = await ai.operations.getVideosOperation({ operation: operation });
        return updatedOperation;
    } catch (error) {
        console.error("Hiba a videógenerálási művelet állapotának lekérdezésekor:", error);
        throw new Error("Nem sikerült lekérdezni a videógenerálás állapotát.");
    }
};


export const startChat = () => {
  chatInstance = ai.chats.create({
    model: 'gemini-2.5-flash',
    config: {
      systemInstruction: 'Ön egy segítőkész és barátságos MI asszisztens.',
    },
  });
};

export const resetChat = () => {
    chatInstance = null;
};

export const sendChatMessage = async (message: string): Promise<string> => {
  if (!chatInstance) {
    startChat();
  }
  try {
    const response = await chatInstance!.sendMessage({ message });
    return response.text;
  } catch (error) {
    console.error("Hiba a csevegés során:", error);
    return "Sajnálom, hiba történt. Kérem, próbálja újra később.";
  }
};

export const answerFromText = async (text: string, question: string): Promise<string> => {
    try {
        const prompt = `Válaszolj a következő kérdésre kizárólag az alább megadott szövegkörnyezet alapján. A válaszod legyen tömör és lényegretörő. Ha a válasz nem található meg a szövegben, egyértelműen közöld, hogy a dokumentum nem tartalmazza a keresett információt.
    
Kérdés: "${question}"

--- SZÖVEGKÖRNYEZET ---
${text}
--- SZÖVEGKÖRNYEZET VÉGE ---
`;
        const response = await ai.models.generateContent({
            model: 'gemini-2.5-flash',
            contents: prompt,
        });
        return response.text;
    } catch (error) {
        console.error("Hiba a szövegből való válaszadáskor:", error);
        return "Hiba: A válasz generálása nem sikerült.";
    }
};

export const summarizeUrlWithSearch = async (url: string): Promise<GroundedResponse> => {
    try {
        const prompt = `Készíts egy részletes, magyar nyelvű összefoglalót a következő weboldal tartalmáról: ${url}`;
        const response = await ai.models.generateContent({
            model: "gemini-2.5-flash",
            contents: prompt,
            config: {
                tools: [{ googleSearch: {} }],
            },
        });

        const sources = response.candidates?.[0]?.groundingMetadata?.groundingChunks || [];

        return {
            text: response.text,
            sources: sources as GroundingSource[],
        };
    } catch (error) {
        console.error("Hiba a weboldal összefoglalásakor:", error);
        throw new Error("A weboldal összefoglalása nem sikerült.");
    }
};

export const factCheckWithSearch = async (claim: string): Promise<GroundedResponse> => {
    try {
        const prompt = `Viselkedj tényellenőrzőként. A Google Keresés segítségével alaposan vizsgáld meg a következő állítást. Adj egyértelmű következtetést (pl. Igaz, Hamis, Részben igaz, Vitatott), és indokold meg a válaszodat a talált bizonyítékok alapján. A válaszod legyen magyar nyelvű. Az állítás: "${claim}"`;
        const response = await ai.models.generateContent({
            model: "gemini-2.5-flash",
            contents: prompt,
            config: {
                tools: [{ googleSearch: {} }],
            },
        });

        const sources = response.candidates?.[0]?.groundingMetadata?.groundingChunks || [];

        return {
            text: response.text,
            sources: sources as GroundingSource[],
        };
    } catch (error) {
        console.error("Hiba a tényellenőrzéskor:", error);
        throw new Error("A tényellenőrzés nem sikerült.");
    }
};

export const generateCv = async (cvData: CvData): Promise<string> => {
    const prompt = `
    Viselkedj egy professzionális HR tanácsadóként és önéletrajz-íróként. A célod, hogy a felhasználó által megadott nyers adatokból egy kiváló minőségű, jól strukturált és meggyőző magyar nyelvű önéletrajzot készíts.

    Az önéletrajzot a következő séma alapján építsd fel, és a tartalmat fogalmazd meg professzionális, de olvasmányos stílusban:
    1.  **Név és Elérhetőségek:** A tetején, jól láthatóan.
    2.  **Szakmai Összegzés:** 3-4 mondatos bekezdés, amely kiemeli a jelölt legfontosabb erősségeit és karriercéljait a megadott adatok alapján.
    3.  **Szakmai Tapasztalat:** Időrendben visszafelé haladva. Minden munkahelynél a feladatokat és eredményeket fogalmazd át aktív, cselekvő igékkel (pl. "fejlesztettem", "irányítottam", "optimalizáltam"). Koncentrálj az elért eredményekre, ne csak a feladatok felsorolására.
    4.  **Tanulmányok:** Időrendben visszafelé.
    5.  **Készségek:** Csoportosítsd a készségeket logikus kategóriákba (pl. Programnyelvek, Eszközök, Nyelvtudás, Soft skillek), ha az adatokból ez lehetséges.

    Kerüld a kliséket. Az eredmény legyen egy letisztult, könnyen áttekinthethő szöveg, amelyet a felhasználó közvetlenül bemásolhat egy önéletrajz sablonba. Ne használj bonyolult formázást, csak alapvető szöveges tagolást (fejezetek, felsorolás). Ne adj hozzá semmilyen extra magyarázatot vagy kommentárt, csak a kész önéletrajz szövegét.

    --- FELHASZNÁLÓI ADATOK ---
    Személyes adatok:
    - Név: ${cvData.fullName}
    - Email: ${cvData.email}
    - Telefon: ${cvData.phone}
    - LinkedIn: ${cvData.linkedin || 'Nincs megadva'}

    Szakmai összegzés (kulcsszavak):
    ${cvData.summary}

    Szakmai tapasztalat:
    ${cvData.workExperience.map(exp => `
    - Pozíció: ${exp.jobTitle}
    - Cég: ${exp.company}, ${exp.location}
    - Időtartam: ${exp.startDate} - ${exp.endDate}
    - Leírás: ${exp.description}
    `).join('')}

    Tanulmányok:
    ${cvData.education.map(edu => `
    - Végzettség: ${edu.degree}
    - Intézmény: ${edu.institution}
    - Befejezés: ${edu.graduationDate}
    `).join('')}

    Készségek (vesszővel elválasztva):
    ${cvData.skills}
    --- FELHASZNÁLÓI ADATOK VÉGE ---
    `;

    try {
        const response = await ai.models.generateContent({
            model: 'gemini-2.5-pro',
            contents: prompt,
        });
        return response.text;
    } catch (error) {
        console.error("Hiba az önéletrajz generálásakor:", error);
        throw new Error("Az önéletrajz generálása nem sikerült. Kérjük, próbálja újra később.");
    }
};

export const generateRecipes = async (ingredients: string): Promise<string> => {
    const prompt = `
    Viselkedj egy kreatív séfként. A feladatod, hogy a felhasználó által megadott alapanyagokból hozz létre egy vagy több ételreceptet. A válaszod legyen jól strukturált, könnyen követhető, és magyar nyelvű.

    A kimenet formátuma a következő legyen minden receptnél:
    1.  **Recept Neve:** (pl., Fokhagymás-tejszínes csirkemell)
    2.  **Hozzávalók:** (Listázd a szükséges hozzávalókat, beleértve a megadottakat és az esetlegesen szükséges alapvető fűszereket, mint só, bors, olaj.)
    3.  **Elkészítés:** (Részletes, lépésről-lépésre leírás.)

    Ha több receptet is javasolsz, válaszd el őket egyértelműen három kötőjellel (---). Csak a recepteket add vissza, extra kommentár vagy bevezető nélkül.

    --- RENDELKEZÉSRE ÁLLÓ ALAPANYAGOK ---
    ${ingredients}
    --- ALAPANYAGOK VÉGE ---
    `;

    try {
        const response = await ai.models.generateContent({
            model: 'gemini-2.5-flash',
            contents: prompt,
        });
        return response.text;
    } catch (error) {
        console.error("Hiba a receptek generálásakor:", error);
        throw new Error("A receptek generálása nem sikerült. Kérjük, próbálja újra később.");
    }
};

export const generateOrDebugCode = async (mode: 'generate' | 'debug', language: string, userInput: string): Promise<string> => {
    let prompt = '';

    if (language === 'Excel Függvények') {
        if (mode === 'generate') {
            prompt = `
Viselkedj egy tapasztalt Excel szakértőként. Írj egy Excel függvényt a következő feladathoz.
A válaszodban **kizárólag a függvényt** add vissza, extra magyarázat, bevezető vagy utóirat nélkül. Ha a feladat leírása magyarázatot kér, akkor azt is add meg.

**Feladat:**
${userInput}
`;
        } else { // debug mode for Excel Functions
            prompt = `
Viselkedj egy tapasztalt Excel szakértőként. Elemezd a következő Excel függvényt.
A válaszodat a következőképpen strukturáld:
1.  **Függvény Célja:** Egy rövid, 1-2 mondatos összefoglaló arról, hogy mit csinál a függvény.
2.  **Részletes Elemzés:** Pontokba szedve írd le a függvény részeit és működését. Ha hibát találsz, magyarázd el közérthetően az okát.
3.  **Javított/Alternatív Függvény:** Add meg a javított vagy egy alternatív, hatékonyabb függvényt.

**Elemzendő Függvény:**
${userInput}
`;
        }
    } else {
        if (mode === 'generate') {
            prompt = `
Viselkedj egy tapasztalt szoftverfejlesztőként. Írj egy tiszta, hatékony és jól kommentezett kódrészletet a következő feladathoz a(z) **${language}** nyelven.
A kód legyen teljes és futtatható. A válaszodban **kizárólag a kódot** add vissza egyetlen kóblokkban, extra magyarázat, bevezető vagy utóirat nélkül.

**Feladat:**
${userInput}
`;
        } else { // debug mode
            prompt = `
Viselkedj egy tapasztalt szoftverfejlesztőként és hibakeresőként. Elemezd a következő **${language}** kódrészletet.
A válaszodat a következőképpen strukturáld:
1.  **Hiba Összegzése:** Egy rövid, 1-2 mondatos összefoglaló a fő problémáról.
2.  **Részletes Elemzés:** Pontokba szedve írd le a talált hibákat (szintaktikai, logikai, stb.). Minden hibánál magyarázd el közérthetően, hogy mi a hiba oka.
3.  **Javított Kód:** Add meg a teljes, javított kódrészletet egyetlen kóblokkban.

**Hibás Kód:**
\`\`\`${language}
${userInput}
\`\`\`
`;
        }
    }


    try {
        const response = await ai.models.generateContent({
            model: 'gemini-2.5-pro', // Using Pro for better code-related tasks
            contents: prompt,
        });
        return response.text;
    } catch (error) {
        console.error("Hiba a kód generálásakor/hibakeresésekor:", error);
        throw new Error("A kérés feldolgozása nem sikerült. Kérjük, próbálja újra később.");
    }
};

export const generatePresentation = async (userInput: string): Promise<Presentation> => {
    const prompt = `
    Készíts egy professzionális prezentáció vázlatot a következő témában vagy forrásanyagból.
    
    Bemenet:
    "${userInput}"

    A prezentáció legyen strukturált, logikus felépítésű, és körülbelül 5-8 diából álljon.
    
    Minden diához generálj:
    1. Címet (title)
    2. Vázlatpontokat (content - tömb). A pontok legyenek rövidek, tömörek.
    3. Részletes angol nyelvű képleírást (imagePrompt), ami alapján egy képgeneráló MI (mint az Imagen) illusztrációt tud készíteni a diához. A prompt legyen vizuális, stílusos és angol nyelvű (pl. "photorealistic, cinematic lighting, 4k...").
    4. Előadói jegyzeteket (speakerNotes), ami segíti az előadót a dia tartalmának kifejtésében. Legyen természetes beszédstílusú.

    A kimenet nyelve legyen magyar (kivéve az imagePrompt).
    `;

    const responseSchema = {
        type: Type.OBJECT,
        properties: {
            topic: { type: Type.STRING },
            slides: {
                type: Type.ARRAY,
                items: {
                    type: Type.OBJECT,
                    properties: {
                        title: { type: Type.STRING },
                        content: {
                            type: Type.ARRAY,
                            items: { type: Type.STRING }
                        },
                        imagePrompt: { type: Type.STRING },
                        speakerNotes: { type: Type.STRING }
                    },
                    required: ["title", "content", "imagePrompt", "speakerNotes"]
                }
            }
        },
        required: ["topic", "slides"]
    };

    try {
        const response = await ai.models.generateContent({
            model: 'gemini-2.5-flash',
            contents: prompt,
            config: {
                responseMimeType: "application/json",
                responseSchema: responseSchema
            }
        });

        const jsonText = response.text.trim();
        return JSON.parse(jsonText) as Presentation;

    } catch (error) {
        console.error("Hiba a prezentáció generálásakor:", error);
        throw new Error("A prezentáció generálása nem sikerült. Kérjük, próbálja újra később.");
    }
};

export const generateCryptoPost = async (amount: string): Promise<string> => {
    const prompt = `
    Készíts egyetlen, figyelemfelkeltő, "hype" stílusú, szép közösségi média mondatot.
    A poszt nyelve legyen ANGOL (crypto twitter stílus).
    
    A mondatnak KÖTELEZŐEN tartalmaznia kell a következő elemeket betűre pontosan:
    1. "${amount}" (az összeg)
    2. "BUY A LAMBO LOTTO"
    3. "$CHESS"
    4. "@base.base.eth"

    Példa stílus: "Just aped ${amount} into $CHESS so I can finally BUY A LAMBO LOTTO on @base.base.eth LFG! 🚀"
    
    Csak a kész mondatot add vissza, semmi mást.
    `;

    try {
        const response = await ai.models.generateContent({
            model: 'gemini-2.5-flash',
            contents: prompt,
        });
        return response.text.trim();
    } catch (error) {
        console.error("Hiba a crypto poszt generálásakor:", error);
        throw new Error("Nem sikerült a poszt generálása.");
    }
};

export const generateChessAd = async (inputText: string): Promise<string> => {
    const prompt = `
    Viselkedj egy profi közösségi média menedzserként.
    A feladatod, hogy a megadott nyers szövegből (ami egy sakkos eseményről, pl. FarChess szól) készíts egy promóciós posztot.
    
    **Stílus:**
    - Profi, letisztult, semleges hangvételű (minimal & neutral).
    - Kerüld a túlzott hype-ot (ne legyen "To the moon", stb.), maradj tárgyilagos és elegáns.
    - Használj releváns emojikat (sakkfigurák, trófea, naptár, stb.), de ízlésesen.
    - Tagold a szöveget logikusan, felsorolásokkal, térközökkel.
    
    **A poszt nyelve:** ANGOL (nemzetközi közösségnek).

    **Bemeneti szöveg:**
    "${inputText}"
    
    Csak a kész poszt szövegét add vissza.
    `;

    try {
        const response = await ai.models.generateContent({
            model: 'gemini-2.5-flash',
            contents: prompt,
        });
        return response.text.trim();
    } catch (error) {
        console.error("Hiba a sakk reklám generálásakor:", error);
        throw new Error("Nem sikerült a poszt generálása.");
    }
};
