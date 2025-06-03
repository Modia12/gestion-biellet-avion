-- Vérifier si la colonne place_reservee existe déjà
DO $$
BEGIN
    IF NOT EXISTS (
        SELECT FROM information_schema.columns 
        WHERE table_schema = 'public' 
        AND table_name = 'reservations' 
        AND column_name = 'place_reservee'
    ) THEN
        -- Ajouter la colonne place_reservee
        ALTER TABLE reservations ADD COLUMN place_reservee INTEGER;
        
        -- Mettre à jour les réservations existantes avec des numéros de siège aléatoires
        UPDATE reservations 
        SET place_reservee = floor(random() * 60) + 1;
        
        -- Ajouter la contrainte NOT NULL et CHECK
        ALTER TABLE reservations 
        ALTER COLUMN place_reservee SET NOT NULL,
        ADD CONSTRAINT check_place_reservee CHECK (place_reservee > 0);
        
        RAISE NOTICE 'Colonne place_reservee ajoutée avec succès';
    ELSE
        RAISE NOTICE 'La colonne place_reservee existe déjà';
    END IF;
END
$$;
