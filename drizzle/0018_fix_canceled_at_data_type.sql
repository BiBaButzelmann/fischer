-- Fix the data type of canceled_at columns from boolean to timestamp

-- For matchday_referee table
ALTER TABLE "matchday_referee" ALTER COLUMN "canceled_at" TYPE timestamp USING 
  CASE 
    WHEN "canceled_at"::boolean = true THEN '1999-12-31 23:00:00'::timestamp
    ELSE NULL 
  END;

-- For matchday_setup_helper table  
ALTER TABLE "matchday_setup_helper" ALTER COLUMN "canceled_at" TYPE timestamp USING 
  CASE 
    WHEN "canceled_at"::boolean = true THEN '1999-12-31 23:00:00'::timestamp
    ELSE NULL 
  END;
