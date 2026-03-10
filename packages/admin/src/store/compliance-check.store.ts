import {
	create,
} from 'zustand'
import type {
	IDocument,
	IEntity,
	IAsset,
} from '../shared/types'
import type {
	IPortfolioDetailed,
	IPortfolio,
} from '../shared/types'

export interface IStoreDocument extends IDocument {
	isChecked: boolean;
	label: string;
  }
export interface IStoreAsset extends IAsset {
	id: string;
	documents: Array<IStoreDocument>;
	isCheckedAll: boolean;
}

export interface IStoreEntity extends IEntity {
	id: string;
	documents: Array<IStoreDocument>;
	assets: Array<IStoreAsset>;
	isCheckedAll: boolean;
}

export interface IStorePortfolio extends IPortfolio {
	documents: Array<IStoreDocument>;
	entities: Array<IStoreEntity>;
	isCheckedAll: boolean;
}

export interface IPorfolioAsset extends IAsset {
	id: string;
	documents: Array<IDocument>;
}

export interface IPorfolioEntity extends IEntity {
	id: string;
	documents: Array<IDocument>;
	assets: Array<IPorfolioAsset>;
}

export interface IStorePortfolioDetailed extends Omit<IPortfolioDetailed, 'documents' | 'entities'> {
	documents: Array<IDocument>;
	entities: Array<IPorfolioEntity>;
}

interface IComplianceCheckState {
  isCheckedAll: boolean;
  items: Array<IStoreDocument>;
  toggleSelectAll: () => void;
  togglePortfolioSelectAll: (portfolioId: string) => void;
  toggleItem: (id: string) => void;
  togglePortfolioItem: (id: string) => void;
  setItems: (documents: Array<IDocument>) => void;
  checkAllSelected: () => void;
  portfolioItems: Array<IStorePortfolio>;
  setPortfolioItems: (porfolios: Array<IStorePortfolioDetailed>) => void;
  toggleEntitySelectAll: (portfolioId: string, entityId: string) => void;
  toggleAssetSelectAll: (portfolioId: string, entityId: string, assetId: string) => void;
  toggleEntityItem: (portfolioId: string, entityId: string, documentId: string,) => void;
  toggleAssetItem: (portfolioId: string, entityId: string, assetId: string, documentId: string,) => void;
  clearAllSelections: () => void
}

const initialValues = {
	isCheckedAll:    		     false,
	items:                  [],
	portfolioItems:         [],
}

export const useComplianceCheckStore = create<IComplianceCheckState>((set, get,) => {
	return {
		...initialValues,
		setItems:               (documents: Array<IDocument>,): void => {
			const mappedItems = documents.map((doc,) => {
				return {
					...doc,
					id:        doc.id,
					label:     doc.name,
					isChecked: false,
				}
			},) as Array<IStoreDocument>
			set({
				items: mappedItems,
			},
			)
		},
		setPortfolioItems: (portfolios: Array<IStorePortfolioDetailed>,): void => {
			const mapDocuments = (documents: Array<IDocument>,): Array<IStoreDocument> => {
				return documents.map((doc,) => {
					return {
						...doc,
						id:        doc.id,
						label:     doc.name,
						isChecked: false,
					}
				},)
			}
			const mappedItems = portfolios.map((portfolio,) => {
				return {
					...portfolio,
					isCheckedAll: false,
					documents:    mapDocuments(portfolio.documents,),
					entities:     portfolio.entities.map((entity,) => {
						return {
							...entity,
							isCheckedAll: false,
							documents:    mapDocuments(entity.documents,),
							assets:       entity.assets.map((asset,) => {
								return {
									...asset,
									isCheckedAll: false,
									documents:    mapDocuments(asset.documents,),
								}
							},),
						}
					},),
				}
			},)
			set({
				portfolioItems: mappedItems,
			},)
		},
		checkAllSelected: (): void => {
			const {
				items,
			} = get()
			if (items.length === 0) {
				set({
					isCheckedAll: false,
				},)
				return
			}

			const isCheckedAll = items.every((item,) => {
				return item.isChecked
			},)
			set({
				isCheckedAll,
			},)
		},
		toggleSelectAll: (): void => {
			const isCheckedAll = !get().isCheckedAll
			set({
				isCheckedAll,
				items: get().items.map((item,) => {
					return {
						...item, isChecked: isCheckedAll,
					}
				},),
			},)
		},
		togglePortfolioSelectAll: (portfolioId: string,): void => {
			set((state,) => {
				const updatedPortfolioItems = state.portfolioItems.map((portfolio,) => {
					if (portfolio.id === portfolioId) {
						const updatedDocuments = portfolio.documents.map((doc,) => {
							return {
								...doc,
								isChecked: !portfolio.isCheckedAll,
							}
						},)
						return {
							...portfolio,
							isCheckedAll: !portfolio.isCheckedAll,
							documents:    updatedDocuments,
						}
					}
					return portfolio
				},)
				const updatedPortfolio = state.portfolioItems.find((portfolio,) => {
					return portfolio.id === portfolioId
				},)
				return {
					portfolioItems:         updatedPortfolioItems,
					portfolioDocuments:	    updatedPortfolio?.documents,
				}
			},)
		},
		toggleItem: (id: string,): void => {
			set((state,) => {
				const updatedItems = state.items.map((item,) => {
					return item.id === id ?
						{
							...item, isChecked: !item.isChecked,
						} :
						item
				},)
				const allChecked = updatedItems.every((item,) => {
					return item.isChecked
				},)
				return {
					items:        updatedItems,
					isCheckedAll: allChecked,
				}
			},)
		},
		togglePortfolioItem: (id: string,): void => {
			set((state,) => {
				const updatedPortfolioItems = state.portfolioItems.map((portfolio,) => {
					const documents = portfolio.documents
						.map((item,) => {
							return item.id === id ?
								{
									...item, isChecked: !item.isChecked,
								} :
								item
						},)
					const isCheckedAll = documents.every((item,) => {
						return item.isChecked
					},)
					return {
						...portfolio,
						documents,
						isCheckedAll,
					}
				},)
				return {
					portfolioItems:     updatedPortfolioItems,
				}
			},)
		},
		toggleEntitySelectAll: (portfolioId: string, entityId: string,): void => {
			set((state,) => {
				const updatedPortfolioItems = state.portfolioItems.map((portfolio,) => {
					if (portfolio.id === portfolioId) {
						const updatedEntities = portfolio.entities.map((entity,) => {
							if (entity.id === entityId) {
								const toggleChecked = !entity.isCheckedAll
								const updatedDocuments = entity.documents.map((doc,) => {
									return {
										...doc,
										isChecked: toggleChecked,
									}
								},)
								return {
									...entity,
									isCheckedAll: toggleChecked,
									documents:    updatedDocuments,
								}
							}
							return entity
						},)
						return {
							...portfolio,
							entities: updatedEntities,
						}
					}
					return portfolio
				},)
				return {
					portfolioItems: updatedPortfolioItems,
				}
			},)
		},
		toggleAssetSelectAll: (portfolioId: string, entityId: string, assetId: string,): void => {
			set((state,) => {
				const updatedPortfolioItems = state.portfolioItems.map((portfolio,) => {
					if (portfolio.id === portfolioId) {
						const updatedEntities = portfolio.entities.map((entity,) => {
							if (entity.id === entityId) {
								const updatedAssets = entity.assets.map((asset,) => {
									if (asset.id === assetId) {
										const toggleChecked = !asset.isCheckedAll
										const updatedDocuments = asset.documents.map((doc,) => {
											return {
												...doc,
												isChecked: toggleChecked,
											}
										},)
										return {
											...asset,
											isCheckedAll: toggleChecked,
											documents:    updatedDocuments,
										}
									}
									return asset
								},)
								return {
									...entity,
									assets: updatedAssets,
								}
							}
							return entity
						},)
						return {
							...portfolio,
							entities: updatedEntities,
						}
					}
					return portfolio
				},)
				return {
					portfolioItems: updatedPortfolioItems,
				}
			},)
		},
		toggleEntityItem: (portfolioId: string, entityId: string, documentId: string,): void => {
			set((state,) => {
				const updatedPortfolioItems = state.portfolioItems.map((portfolio,) => {
					if (portfolio.id === portfolioId) {
						const updatedEntities = portfolio.entities.map((entity,) => {
							if (entity.id === entityId) {
								const updatedEntityDocuments = entity.documents.map((doc,) => {
									return (doc.id === documentId ?
										{
											...doc, isChecked: !doc.isChecked,
										} :
										doc)
								},
								)
								const isCheckedAllForEntity = updatedEntityDocuments.every((doc,) => {
									return doc.isChecked
								},)
								return {
									...entity,
									isCheckedAll: isCheckedAllForEntity,
									documents:    updatedEntityDocuments,
								}
							}
							return entity
						},)
						return {
							...portfolio,
							entities: updatedEntities,
						}
					}
					return portfolio
				},)
				return {
					portfolioItems: updatedPortfolioItems,
				}
			},)
		},
		toggleAssetItem: (portfolioId: string, entityId: string, assetId: string, documentId: string,): void => {
			set((state,) => {
				const updatedPortfolioItems = state.portfolioItems.map((portfolio,) => {
					if (portfolio.id === portfolioId) {
						const updatedEntities = portfolio.entities.map((entity,) => {
							if (entity.id === entityId) {
								const updatedAssets = entity.assets.map((asset,) => {
									if (asset.id === assetId) {
										const updatedAssetDocuments = asset.documents.map((doc,) => {
											return (doc.id === documentId ?
												{
													...doc, isChecked: !doc.isChecked,
												} :
												doc)
										},
										)
										const isCheckedAllForAsset = updatedAssetDocuments.every((doc,) => {
											return doc.isChecked
										},)
										return {
											...asset,
											isCheckedAll: isCheckedAllForAsset,
											documents:    updatedAssetDocuments,
										}
									}
									return asset
								},)
								return {
									...entity,
									assets: updatedAssets,
								}
							}
							return entity
						},)
						return {
							...portfolio,
							entities: updatedEntities,
						}
					}
					return portfolio
				},)
				return {
					portfolioItems: updatedPortfolioItems,
				}
			},)
		},
		clearAllSelections: (): void => {
			set((state,) => {
				return {
					items: state.items.map((item,) => {
						return {
							...item,
							isChecked: false,
						}
					},),
					portfolioItems: state.portfolioItems.map((portfolio,) => {
						return {
							...portfolio,
							isCheckedAll: false,
							documents:    portfolio.documents.map((doc,) => {
								return {
									...doc,
									isChecked: false,
								}
							},),
							entities: portfolio.entities.map((entity,) => {
								return {
									...entity,
									isCheckedAll: false,
									documents:    entity.documents.map((doc,) => {
										return {
											...doc,
											isChecked: false,
										}
									},),
									assets: entity.assets.map((asset,) => {
										return {
											...asset,
											isCheckedAll: false,
											documents:    asset.documents.map((doc,) => {
												return {
													...doc,
													isChecked: false,
												}
											},),
										}
									},),
								}
							},),
						}
					},),
					isCheckedAll: false,
				}
			},)
		},
	}
},)
