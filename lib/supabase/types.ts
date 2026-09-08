export type Json =
  | string
  | number
  | boolean
  | null
  | { [key: string]: Json | undefined }
  | Json[]

export type UserRole = 'customer' | 'staff' | 'admin'
export type CatalogStatus = 'draft' | 'active' | 'archived'
export type VariantStatus = 'active' | 'inactive' | 'archived'
export type SectionStatus = 'draft' | 'published' | 'archived'
export type InventoryReason =
  | 'initial_stock'
  | 'restock'
  | 'sale'
  | 'return'
  | 'adjustment'
  | 'damage'

export interface Database {
  public: {
    Tables: {
      profiles: {
        Row: {
          id: string
          full_name: string | null
          phone: string | null
          role: UserRole
          is_active: boolean
          created_at: string
          updated_at: string
        }
        Insert: {
          id: string
          full_name?: string | null
          phone?: string | null
          role?: UserRole
          is_active?: boolean
          created_at?: string
          updated_at?: string
        }
        Update: {
          id?: string
          full_name?: string | null
          phone?: string | null
          role?: UserRole
          is_active?: boolean
          created_at?: string
          updated_at?: string
        }
        Relationships: []
      }
      customers: {
        Row: {
          id: string
          auth_user_id: string | null
          email: string
          phone: string | null
          first_name: string | null
          last_name: string | null
          marketing_opt_in: boolean
          notes: string | null
          total_orders: number
          total_spent_paise: number
          created_at: string
          updated_at: string
        }
        Insert: {
          id?: string
          auth_user_id?: string | null
          email: string
          phone?: string | null
          first_name?: string | null
          last_name?: string | null
          marketing_opt_in?: boolean
          notes?: string | null
          total_orders?: number
          total_spent_paise?: number
          created_at?: string
          updated_at?: string
        }
        Update: {
          id?: string
          auth_user_id?: string | null
          email?: string
          phone?: string | null
          first_name?: string | null
          last_name?: string | null
          marketing_opt_in?: boolean
          notes?: string | null
          total_orders?: number
          total_spent_paise?: number
          created_at?: string
          updated_at?: string
        }
        Relationships: []
      }
      customer_addresses: {
        Row: {
          id: string
          customer_id: string
          label: string | null
          recipient_name: string
          phone: string
          line1: string
          line2: string | null
          landmark: string | null
          city: string
          state: string
          postal_code: string
          country_code: string
          is_default_shipping: boolean
          is_default_billing: boolean
          created_at: string
          updated_at: string
        }
        Insert: {
          id?: string
          customer_id: string
          label?: string | null
          recipient_name: string
          phone: string
          line1: string
          line2?: string | null
          landmark?: string | null
          city: string
          state: string
          postal_code: string
          country_code?: string
          is_default_shipping?: boolean
          is_default_billing?: boolean
          created_at?: string
          updated_at?: string
        }
        Update: {
          id?: string
          customer_id?: string
          label?: string | null
          recipient_name?: string
          phone?: string
          line1?: string
          line2?: string | null
          landmark?: string | null
          city?: string
          state?: string
          postal_code?: string
          country_code?: string
          is_default_shipping?: boolean
          is_default_billing?: boolean
          created_at?: string
          updated_at?: string
        }
        Relationships: [
          {
            foreignKeyName: 'customer_addresses_customer_id_fkey'
            columns: ['customer_id']
            isOneToOne: false
            referencedRelation: 'customers'
            referencedColumns: ['id']
          },
        ]
      }
      categories: {
        Row: {
          id: string
          parent_id: string | null
          name: string
          slug: string
          description: string | null
          image_path: string | null
          sort_order: number
          status: CatalogStatus
          seo_title: string | null
          seo_description: string | null
          canonical_url: string | null
          created_at: string
          updated_at: string
        }
        Insert: {
          id?: string
          parent_id?: string | null
          name: string
          slug: string
          description?: string | null
          image_path?: string | null
          sort_order?: number
          status?: CatalogStatus
          seo_title?: string | null
          seo_description?: string | null
          canonical_url?: string | null
          created_at?: string
          updated_at?: string
        }
        Update: {
          id?: string
          parent_id?: string | null
          name?: string
          slug?: string
          description?: string | null
          image_path?: string | null
          sort_order?: number
          status?: CatalogStatus
          seo_title?: string | null
          seo_description?: string | null
          canonical_url?: string | null
          created_at?: string
          updated_at?: string
        }
        Relationships: [
          {
            foreignKeyName: 'categories_parent_id_fkey'
            columns: ['parent_id']
            isOneToOne: false
            referencedRelation: 'categories'
            referencedColumns: ['id']
          },
        ]
      }
      collections: {
        Row: {
          id: string
          name: string
          slug: string
          description: string | null
          image_path: string | null
          banner_path: string | null
          sort_order: number
          status: CatalogStatus
          seo_title: string | null
          seo_description: string | null
          canonical_url: string | null
          created_at: string
          updated_at: string
        }
        Insert: {
          id?: string
          name: string
          slug: string
          description?: string | null
          image_path?: string | null
          banner_path?: string | null
          sort_order?: number
          status?: CatalogStatus
          seo_title?: string | null
          seo_description?: string | null
          canonical_url?: string | null
          created_at?: string
          updated_at?: string
        }
        Update: {
          id?: string
          name?: string
          slug?: string
          description?: string | null
          image_path?: string | null
          banner_path?: string | null
          sort_order?: number
          status?: CatalogStatus
          seo_title?: string | null
          seo_description?: string | null
          canonical_url?: string | null
          created_at?: string
          updated_at?: string
        }
        Relationships: []
      }
      products: {
        Row: {
          id: string
          name: string
          slug: string
          short_description: string | null
          description: string | null
          status: CatalogStatus
          brand: string | null
          fabric: string | null
          weave: string | null
          color: string | null
          occasion: string | null
          saree_length_cm: number | null
          blouse_piece_included: boolean
          blouse_piece_length_cm: number | null
          care_instructions: string | null
          hsn_code: string | null
          gst_rate: number | null
          is_featured: boolean
          seo_title: string | null
          seo_description: string | null
          canonical_url: string | null
          created_at: string
          updated_at: string
        }
        Insert: {
          id?: string
          name: string
          slug: string
          short_description?: string | null
          description?: string | null
          status?: CatalogStatus
          brand?: string | null
          fabric?: string | null
          weave?: string | null
          color?: string | null
          occasion?: string | null
          saree_length_cm?: number | null
          blouse_piece_included?: boolean
          blouse_piece_length_cm?: number | null
          care_instructions?: string | null
          hsn_code?: string | null
          gst_rate?: number | null
          is_featured?: boolean
          seo_title?: string | null
          seo_description?: string | null
          canonical_url?: string | null
          created_at?: string
          updated_at?: string
        }
        Update: {
          id?: string
          name?: string
          slug?: string
          short_description?: string | null
          description?: string | null
          status?: CatalogStatus
          brand?: string | null
          fabric?: string | null
          weave?: string | null
          color?: string | null
          occasion?: string | null
          saree_length_cm?: number | null
          blouse_piece_included?: boolean
          blouse_piece_length_cm?: number | null
          care_instructions?: string | null
          hsn_code?: string | null
          gst_rate?: number | null
          is_featured?: boolean
          seo_title?: string | null
          seo_description?: string | null
          canonical_url?: string | null
          created_at?: string
          updated_at?: string
        }
        Relationships: []
      }
      product_variants: {
        Row: {
          id: string
          product_id: string
          sku: string
          barcode: string | null
          title: string
          attributes: Json
          price_paise: number
          compare_at_price_paise: number | null
          cost_paise: number | null
          weight_grams: number | null
          track_inventory: boolean
          allow_backorder: boolean
          stock_on_hand: number
          low_stock_threshold: number
          status: VariantStatus
          created_at: string
          updated_at: string
        }
        Insert: {
          id?: string
          product_id: string
          sku: string
          barcode?: string | null
          title?: string
          attributes?: Json
          price_paise: number
          compare_at_price_paise?: number | null
          cost_paise?: number | null
          weight_grams?: number | null
          track_inventory?: boolean
          allow_backorder?: boolean
          stock_on_hand?: number
          low_stock_threshold?: number
          status?: VariantStatus
          created_at?: string
          updated_at?: string
        }
        Update: {
          id?: string
          product_id?: string
          sku?: string
          barcode?: string | null
          title?: string
          attributes?: Json
          price_paise?: number
          compare_at_price_paise?: number | null
          cost_paise?: number | null
          weight_grams?: number | null
          track_inventory?: boolean
          allow_backorder?: boolean
          stock_on_hand?: number
          low_stock_threshold?: number
          status?: VariantStatus
          created_at?: string
          updated_at?: string
        }
        Relationships: [
          {
            foreignKeyName: 'product_variants_product_id_fkey'
            columns: ['product_id']
            isOneToOne: false
            referencedRelation: 'products'
            referencedColumns: ['id']
          },
        ]
      }
      product_images: {
        Row: {
          id: string
          product_id: string
          variant_id: string | null
          storage_path: string
          alt_text: string | null
          sort_order: number
          is_primary: boolean
          created_at: string
          updated_at: string
        }
        Insert: {
          id?: string
          product_id: string
          variant_id?: string | null
          storage_path: string
          alt_text?: string | null
          sort_order?: number
          is_primary?: boolean
          created_at?: string
          updated_at?: string
        }
        Update: {
          id?: string
          product_id?: string
          variant_id?: string | null
          storage_path?: string
          alt_text?: string | null
          sort_order?: number
          is_primary?: boolean
          created_at?: string
          updated_at?: string
        }
        Relationships: [
          {
            foreignKeyName: 'product_images_product_id_fkey'
            columns: ['product_id']
            isOneToOne: false
            referencedRelation: 'products'
            referencedColumns: ['id']
          },
        ]
      }
      product_categories: {
        Row: {
          id: string
          product_id: string
          category_id: string
          created_at: string
        }
        Insert: {
          id?: string
          product_id: string
          category_id: string
          created_at?: string
        }
        Update: {
          id?: string
          product_id?: string
          category_id?: string
          created_at?: string
        }
        Relationships: [
          {
            foreignKeyName: 'product_categories_product_id_fkey'
            columns: ['product_id']
            isOneToOne: false
            referencedRelation: 'products'
            referencedColumns: ['id']
          },
          {
            foreignKeyName: 'product_categories_category_id_fkey'
            columns: ['category_id']
            isOneToOne: false
            referencedRelation: 'categories'
            referencedColumns: ['id']
          },
        ]
      }
      product_collections: {
        Row: {
          id: string
          product_id: string
          collection_id: string
          sort_order: number
          created_at: string
        }
        Insert: {
          id?: string
          product_id: string
          collection_id: string
          sort_order?: number
          created_at?: string
        }
        Update: {
          id?: string
          product_id?: string
          collection_id?: string
          sort_order?: number
          created_at?: string
        }
        Relationships: [
          {
            foreignKeyName: 'product_collections_product_id_fkey'
            columns: ['product_id']
            isOneToOne: false
            referencedRelation: 'products'
            referencedColumns: ['id']
          },
          {
            foreignKeyName: 'product_collections_collection_id_fkey'
            columns: ['collection_id']
            isOneToOne: false
            referencedRelation: 'collections'
            referencedColumns: ['id']
          },
        ]
      }
      inventory_movements: {
        Row: {
          id: string
          variant_id: string
          quantity_delta: number
          reason: InventoryReason
          reference_type: string | null
          reference_id: string | null
          note: string | null
          created_by: string | null
          created_at: string
        }
        Insert: {
          id?: string
          variant_id: string
          quantity_delta: number
          reason: InventoryReason
          reference_type?: string | null
          reference_id?: string | null
          note?: string | null
          created_by?: string | null
          created_at?: string
        }
        Update: {
          id?: string
          variant_id?: string
          quantity_delta?: number
          reason?: InventoryReason
          reference_type?: string | null
          reference_id?: string | null
          note?: string | null
          created_by?: string | null
          created_at?: string
        }
        Relationships: [
          {
            foreignKeyName: 'inventory_movements_variant_id_fkey'
            columns: ['variant_id']
            isOneToOne: false
            referencedRelation: 'product_variants'
            referencedColumns: ['id']
          },
        ]
      }
      homepage_sections: {
        Row: {
          id: string
          section_key: string
          sort_order: number
          title: string | null
          subtitle: string | null
          body: string | null
          image_path: string | null
          mobile_image_path: string | null
          cta_label: string | null
          cta_url: string | null
          status: SectionStatus
          is_active: boolean
          seo_title: string | null
          seo_description: string | null
          created_at: string
          updated_at: string
        }
        Insert: {
          id?: string
          section_key: string
          sort_order?: number
          title?: string | null
          subtitle?: string | null
          body?: string | null
          image_path?: string | null
          mobile_image_path?: string | null
          cta_label?: string | null
          cta_url?: string | null
          status?: SectionStatus
          is_active?: boolean
          seo_title?: string | null
          seo_description?: string | null
          created_at?: string
          updated_at?: string
        }
        Update: {
          id?: string
          section_key?: string
          sort_order?: number
          title?: string | null
          subtitle?: string | null
          body?: string | null
          image_path?: string | null
          mobile_image_path?: string | null
          cta_label?: string | null
          cta_url?: string | null
          status?: SectionStatus
          is_active?: boolean
          seo_title?: string | null
          seo_description?: string | null
          created_at?: string
          updated_at?: string
        }
        Relationships: []
      }
    }
    Views: {
      catalog_product_variants: {
        Row: {
          id: string
          product_id: string
          sku: string
          title: string
          attributes: Json
          price_paise: number
          compare_at_price_paise: number | null
          status: string
          is_in_stock: boolean
          created_at: string
          updated_at: string
        }
        Relationships: []
      }
      admin_product_variants: {
        Row: Database['public']['Tables']['product_variants']['Row']
        Relationships: []
      }
      admin_customers: {
        Row: Database['public']['Tables']['customers']['Row']
        Relationships: []
      }
    }
    Functions: {
      is_staff: {
        Args: Record<PropertyKey, never>
        Returns: boolean
      }
      is_admin: {
        Args: Record<PropertyKey, never>
        Returns: boolean
      }
      owns_customer: {
        Args: {
          target_customer_id: string
        }
        Returns: boolean
      }
    }
  }
}
