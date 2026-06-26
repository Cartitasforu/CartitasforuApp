import { supabase } from '@/lib/supabase';

export async function recordUserConsent(userId: string, {
  documentType = 'terms_of_service',
  version = '1.0.0',
} = {}) {
  // Inserta el consentimiento en la tabla `user_consent` y marca onboarding como completado
  const { error: consentError } = await supabase
    .from('user_consent')
    .insert({
      user_id: userId,
      document_type: documentType,
      version,
      accepted_at: new Date().toISOString(),
    });

  if (consentError) {
    console.log('Consent error', consentError.message);
    throw consentError;
  }

  const { error: profileError } = await supabase
    .from('user')
    .update({ onboarding_completed: true })
    .eq('id', userId);

  if (profileError) {
    console.log('Profile update error', profileError.message);
    throw profileError;
  }

  return true;
}
