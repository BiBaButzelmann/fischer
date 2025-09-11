-- Convert boolean canceled_at columns to timestamp
-- Use CASE to convert boolean values: true -> current timestamp, false/null -> null
ALTER TABLE "matchday_referee" 
  ALTER COLUMN "canceled_at" TYPE timestamp 
  USING CASE 
    WHEN "canceled_at" = true THEN now() 
    ELSE null 
  END;--> statement-breakpoint
  
ALTER TABLE "matchday_setup_helper" 
  ALTER COLUMN "canceled_at" TYPE timestamp 
  USING CASE 
    WHEN "canceled_at" = true THEN now() 
    ELSE null 
  END;