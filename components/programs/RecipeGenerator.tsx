import React, { useState } from 'react';
import { generateRecipes } from '../../services/geminiService';
import { UtensilsCrossed } from 'lucide-react';

export const RecipeGenerator: React.FC = () => {
    const [ingredients, setIngredients] = useState('');
    const [recipe, setRecipe] = useState('');
    const [isLoading, setIsLoading] = useState(false);
    const [error, setError] = useState('');

    const handleGenerate = async () => {
        if (!ingredients.trim()) {
            setError('Az alapanyagok listája nem lehet üres.');
            return;
        }

        setIsLoading(true);
        setError('');
        setRecipe('');

        try {
            const result = await generateRecipes(ingredients);
            setRecipe(result);
        } catch (err: any) {
            setError(err.message || 'Hiba történt a receptek generálása közben.');
        } finally {
            setIsLoading(false);
        }
    };

    return (
        <div className="space-y-6">
            <div>
                <label htmlFor="ingredients-input" className="block mb-2 font-semibold text-dark">Rendelkezésre álló alapanyagok</label>
                <textarea
                    id="ingredients-input"
                    value={ingredients}
                    onChange={(e) => setIngredients(e.target.value)}
                    placeholder="pl., csirkemell, hagyma, tejszín, rizs, fokhagyma, só, bors..."
                    rows={6}
                    className="w-full bg-surface text-dark placeholder-muted rounded-md px-3 py-2 border border-medium focus:outline-none focus:ring-2 focus:ring-accent font-sans"
                    aria-label="Rendelkezésre álló alapanyagok"
                />
            </div>

            <button
                onClick={handleGenerate}
                disabled={isLoading || !ingredients.trim()}
                className="w-full flex items-center justify-center gap-2 bg-accent hover:bg-accent-hover text-white font-bold py-3 px-4 rounded-md transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
            >
                {isLoading ? 'Receptek keresése...' : (
                    <>
                        <UtensilsCrossed size={20}/>
                        <span>Recept Generálása</span>
                    </>
                )}
            </button>
            
            {error && <div className="text-red-500 text-center" role="alert">{error}</div>}
            
            {isLoading && <div className="text-center p-8">MI séfünk már gondolkodik a tökéletes fogáson...</div>}

            {recipe && (
                <div>
                    <h3 className="font-semibold text-2xl text-dark mb-2">Receptjavaslatok</h3>
                    <div className="p-4 bg-surface text-dark rounded-md border border-medium whitespace-pre-wrap font-sans leading-relaxed">
                        {recipe}
                    </div>
                </div>
            )}
        </div>
    );
};
