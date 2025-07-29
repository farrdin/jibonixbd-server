export interface Inventory {
  id: string
  donation_id: string
  item_name: string
  quantity?: number | null
  amount?: number | null
  expiry_date?: string | null
  warehouse_location?: string | null
  created_at: string
  updated_at: string
}

export interface CreateInventoryInput {
  donation_id: string
  item_name: string
  quantity?: number | null
  amount?: number | null
  expiry_date?: string | null
  warehouse_location?: string | null
}
