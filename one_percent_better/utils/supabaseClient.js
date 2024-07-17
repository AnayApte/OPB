import { createClient } from '@supabase/supabase-js'
import { SUPABASEURL, SUPABASEKEY } from '@env';

const supabaseUrl = {SUPABASEURL}
const supabaseAnonKey = {SUPABASEKEY}

export const supabase = createClient(supabaseUrl, supabaseAnonKey)
