import {
	create,
} from 'zustand'

type DocumentWithFile = {
  documentType: string;
  file: File;
};

type DocumentStoreState = {
  documents: Array<DocumentWithFile>;
};

type DocumentStoreActions = {
  addDocument: (documentType: string, file: File) => void;
  removeDocument: (index: number) => void;
  clearDocuments: () => void
};

export const useDocumentStore = create<DocumentStoreState & DocumentStoreActions>()((set,) => {
	return {
		documents:   [],
		addDocument: (documentType, file,): void => {
			set((state,) => {
				return {
					documents: [...state.documents, {
						documentType, file,
					},],
				}
			},)
		},
		removeDocument: (index,): void => {
			set((state,) => {
				return {
					documents: state.documents.filter((item, i,) => {
						return i !== index
					},),
				}
			},)
		},
		clearDocuments: (): void => {
			set(() => {
				return {
					documents: [],
				}
			},)
		},
	}
},)
