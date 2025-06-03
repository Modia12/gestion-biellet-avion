-- Vérifier si la table paiements existe, sinon la créer
DO $$
BEGIN
    IF NOT EXISTS (SELECT FROM information_schema.tables WHERE table_schema = 'public' AND table_name = 'paiements') THEN
        CREATE TABLE paiements (
            id_paiement SERIAL PRIMARY KEY,
            id_reservation INTEGER NOT NULL REFERENCES reservations(id_reservation) ON DELETE CASCADE,
            montant DECIMAL(10, 2) NOT NULL,
            montant_total DECIMAL(10, 2),
            date_paiement TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
            mode_paiement VARCHAR(50) NOT NULL,
            type_paiement VARCHAR(20) DEFAULT 'complet',
            statut VARCHAR(20) DEFAULT 'complete'
        );

        -- Créer un index sur id_reservation pour améliorer les performances
        CREATE INDEX idx_paiements_reservation ON paiements(id_reservation);
        
        RAISE NOTICE 'Table paiements créée avec succès';
    ELSE
        -- Vérifier si les colonnes nécessaires existent
        BEGIN
            -- Vérifier si la colonne montant_total existe
            IF NOT EXISTS (SELECT FROM information_schema.columns 
                          WHERE table_schema = 'public' AND table_name = 'paiements' AND column_name = 'montant_total') THEN
                ALTER TABLE paiements ADD COLUMN montant_total DECIMAL(10, 2);
                RAISE NOTICE 'Colonne montant_total ajoutée';
            END IF;
            
            -- Vérifier si la colonne type_paiement existe
            IF NOT EXISTS (SELECT FROM information_schema.columns 
                          WHERE table_schema = 'public' AND table_name = 'paiements' AND column_name = 'type_paiement') THEN
                ALTER TABLE paiements ADD COLUMN type_paiement VARCHAR(20) DEFAULT 'complet';
                RAISE NOTICE 'Colonne type_paiement ajoutée';
            END IF;
            
            -- Vérifier si la colonne statut existe
            IF NOT EXISTS (SELECT FROM information_schema.columns 
                          WHERE table_schema = 'public' AND table_name = 'paiements' AND column_name = 'statut') THEN
                ALTER TABLE paiements ADD COLUMN statut VARCHAR(20) DEFAULT 'complete';
                RAISE NOTICE 'Colonne statut ajoutée';
            END IF;
            
            -- Mettre à jour les valeurs existantes si nécessaire
            UPDATE paiements 
            SET montant_total = montant,
                type_paiement = 'complet',
                statut = 'complete'
            WHERE montant_total IS NULL;
            
            RAISE NOTICE 'Table paiements mise à jour avec succès';
        END;
    END IF;
END
$$;
