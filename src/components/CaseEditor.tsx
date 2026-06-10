import type { Case, Effect } from '@/types/game';
import { useState } from 'react';

type CaseEditorProps = {
  case: Case;
  onSave: (updatedCase: Case) => void;
  onCancel: () => void;
};

export default function CaseEditor({ case: initialCase, onSave, onCancel }: CaseEditorProps) {
  const [editCase, setEditCase] = useState<Case>({ ...initialCase });
  const [effectValue, setEffectValue] = useState<number | undefined>(editCase.effect?.value);
  const [effectMessage, setEffectMessage] = useState<string | undefined>(editCase.effect?.message);

  // Sync effect fields when effect type changes
  const handleEffectTypeChange = (e: React.ChangeEvent<HTMLSelectElement>) => {
    const type = e.target.value as Effect['type'];
    setEditCase((prev) => ({
      ...prev,
      effect: {
        ...(prev.effect ?? {}),
        type,
        // reset value/message if they are not applicable? keep as undefined
        value: type === 'avance' || type === 'recule' ? (effectValue ?? 0) : undefined,
        message:
          type === 'avance' || type === 'recule' || type === 'retour_depart'
            ? effectMessage
            : undefined,
      },
    }));
    // reset derived state
    setEffectValue(undefined);
    setEffectMessage(undefined);
  };

  const handleValueChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const val = parseInt(e.target.value, 10);
    setEffectValue(isNaN(val) ? undefined : val);
    setEditCase((prev) => ({
      ...prev,
      effect: prev.effect
        ? { ...prev.effect, value: isNaN(val) ? undefined : val }
        : undefined,
    }));
  };

  const handleMessageChange = (e: React.ChangeEvent<HTMLTextAreaElement>) => {
    const msg = e.target.value;
    setEffectMessage(msg);
    setEditCase((prev) => ({
      ...prev,
      effect: prev.effect
        ? { ...prev.effect, message: msg === '' ? undefined : msg }
        : undefined,
    }));
  };

  const handleSave = () => {
    // Ensure effect object is correctly formed
    const finalEffect =
      editCase.effect?.type === 'avance' ||
      editCase.effect?.type === 'recule'
        ? {
            type: editCase.effect.type,
            value: effectValue ?? 0,
            message: effectMessage,
          }
        : editCase.effect?.type === 'passe_tour'
        ? { type: 'passe_tour' }
        : editCase.effect?.type === 'rejoue'
        ? { type: 'rejoue' }
        : editCase.effect?.type === 'retour_depart'
        ? { type: 'retour_depart', message: effectMessage }
        : undefined;

    const toSave = {
      ...editCase,
      effect: finalEffect,
    };
    onSave(toSave);
    onCancel();
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50">
      <div className="relative w-full max-w-lg p-6 bg-white rounded-lg shadow-lg">
        <div className="flex justify-between items-center mb-4">
          <h2 className="text-xl font-bold">Éditer la case #{editCase.id}</h2>
          <button
            onClick={onCancel}
            className="text-gray-500 hover:text-gray-700"
          >
            ×
          </button>
        </div>

        <form className="space-y-4">
          <div>
            <label className="block text-sm font-medium mb-1">Label</label>
            <input
              type="text"
              value={editCase.label}
              onChange={(e) =>
                setEditCase((prev) => ({ ...prev, label: e.target.value }))
              }
              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
            />
          </div>

          <div>
            <label className="block text-sm font-medium mb-1">Couleur</label>
            <input
              type="color"
              value={editCase.color}
              onChange={(e) =>
                setEditCase((prev) => ({ ...prev, color: e.target.value }))
              }
              className="w-16 h-10 p-1"
            />
          </div>

          <div>
            <label className="block text-sm font-medium mb-1">URL d'image (facultatif)</label>
            <input
              type="text"
              placeholder="https://exemple.com/image.png"
              value={editCase.image ?? ''}
              onChange={(e) =>
                setEditCase((prev) => ({
                  ...prev,
                  image: e.target.value || undefined,
                }))
              }
              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
            />
          </div>

          <div>
            <label className="block text-sm font-medium mb-1">Effet</label>
            <select
              value={editCase.effect?.type ?? undefined}
              onChange={handleEffectTypeChange}
              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
            >
              <option value="">Aucun</option>
              <option value="avance">Avance</option>
              <option value="recule">Recule</option>
              <option value="passe_tour">Passe tour</option>
              <option value="rejoue">Rejoue</option>
              <option value="retour_depart">Retour au départ</option>
            </select>
          </div>

          {(editCase.effect?.type === 'avance' ||
            editCase.effect?.type === 'recule') && (
            <div>
              <label className="block text-sm font-medium mb-1">
                Valeur (cases)
              </label>
              <input
                type="number"
                min={0}
                value={effectValue ?? 0}
                onChange={handleValueChange}
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
              />
            </div>
          )}

          {(editCase.effect?.type === 'avance' ||
            editCase.effect?.type === 'recule' ||
            editCase.effect?.type === 'retour_depart') && (
            <div>
              <label className="block text-sm font-medium mb-1">
                Message (facultatif)
              </label>
              <textarea
                value={effectMessage ?? ''}
                onChange={handleMessageChange}
                rows={2}
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
              />
            </div>
          )}

          <div className="flex justify-end space-x-3">
            <button
              type="button"
              onClick={onCancel}
              className="px-4 py-2 bg-gray-200 text-gray-800 rounded hover:bg-gray-300"
            >
              Annuler
            </button>
            <button
              type="button"
              onClick={handleSave}
              className="px-4 py-2 bg-blue-600 text-white rounded hover:bg-blue-700"
            >
              Sauvegarder
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}