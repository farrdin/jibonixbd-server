export interface Inventory {
  id: number
  donation_id: number
  item_name: string
  quantity?: number | null
  amount?: number | null
  expiry_date?: string | null
  warehouse_location?: string | null
  created_at: string
  updated_at: string
}

export interface CreateInventoryInput {
  donation_id: number
  item_name: string
  quantity?: number | null
  amount?: number | null
  expiry_date?: string | null
  warehouse_location?: string | null
}
