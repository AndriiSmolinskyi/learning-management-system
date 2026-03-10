import {
	create,
} from 'zustand'

type OldDocumentUI = {
  id: string;
  format: string;
  type: string;
};

type OldDocumentStoreState = {
  oldDocuments: Array<OldDocumentUI>;
  oldDocumentsToRemove: Array<string>;
};

type OldDocumentStoreActions = {
  setOldDocuments: (documents: Array<OldDocumentUI>) => void;
  removeOldDocument: (id: string) => void;
  clearOldDocuments: () => void;
};

export const useOldDocumentStore = create<OldDocumentStoreState & OldDocumentStoreActions>()((set,): OldDocumentStoreState & OldDocumentStoreActions => {
	return {
		oldDocuments:         [],
		oldDocumentsToRemove: [],

		setOldDocuments: (documents: Array<OldDocumentUI>,): void => {
			set(() => {
				return {
					oldDocuments: documents,
				}
			},)
		},

		removeOldDocument: (id: string,): void => {
			set((state,) => {
				return {
					oldDocuments:         state.oldDocuments.filter((doc,) => {
						return doc.id !== id
					},),
					oldDocumentsToRemove: [...state.oldDocumentsToRemove, id,],
				}
			},)
		},

		clearOldDocuments: (): void => {
			set(() => {
				return {
					oldDocuments:         [],
					oldDocumentsToRemove: [],
				}
			},)
		},
	}
},)
