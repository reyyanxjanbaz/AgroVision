# Data Model: AgroVision Core Platform

**Feature**: Core Platform (001)
**Database**: PostgreSQL (Supabase)

## Entity Relationship Diagram

```mermaid
erDiagram
    CROPS ||--o{ PRICE_HISTORY : has
    CROPS ||--o{ FACTORS : influenced_by
    CROPS ||--o{ NEWS : related_to
    CROPS {
        uuid id PK
        string name
        string category
        string image_url
        text description
        decimal current_price
        decimal price_change_24h
        decimal price_change_7d
        string unit
    }
    PRICE_HISTORY {
        uuid id PK
        uuid crop_id FK
        decimal price
        timestamp date
        string region
        string source
    }
    FACTORS {
        uuid id PK
        uuid crop_id FK
        string factor_type
        text description
        decimal impact_score
        timestamp date
    }
    NEWS {
        uuid id PK
        uuid crop_id FK
        string title
        text summary
        string url
        string image_url
        timestamp published_date
        string source
    }
```

## Table Definitions

### `crops`

Core entity representing agricultural products.

- `id`: UUID, Primary Key
- `name`: Text, Unique (e.g., "Wheat")
- `category`: Text (e.g., "Grains", "Vegetables")
- `image_url`: Text (URL to image asset)
- `description`: Text
- `current_price`: Decimal (Cached latest price for quick access)
- `price_change_24h`: Decimal (Percentage change)
- `price_change_7d`: Decimal (Percentage change)
- `unit`: Text (e.g., "₹/quintal", "$/bushel")

### `price_history`

Historical pricing data for charting and analysis.

- `id`: UUID, Primary Key
- `crop_id`: UUID, Foreign Key -> crops.id
- `price`: Decimal
- `date`: Timestamp
- `region`: Text (e.g., "Punjab", "Kansas")
- `source`: Text (e.g., "USDA", "Local Mandi")

### `factors`

Influencing factors for price prediction and explanation.

- `id`: UUID, Primary Key
- `crop_id`: UUID, Foreign Key -> crops.id
- `factor_type`: Text ('weather', 'supply', 'demand', 'policy')
- `description`: Text
- `impact_score`: Decimal (-100 to +100, representing % impact)
- `date`: Timestamp

### `news`

Aggregated news articles.

- `id`: UUID, Primary Key
- `crop_id`: UUID, Foreign Key -> crops.id (Nullable, if general news)
- `title`: Text
- `summary`: Text
- `url`: Text
- `image_url`: Text
- `published_date`: Timestamp
- `source`: Text
