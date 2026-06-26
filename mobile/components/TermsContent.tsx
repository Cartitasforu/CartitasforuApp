// components/TermsContent.tsx
import React from 'react';
import { Text, StyleSheet, View } from 'react-native';

export function TermsContent() {
  return (
    <View style={styles.content}>
      <Text style={styles.heading}>1. Aceptación de los Términos</Text>
      <Text style={styles.paragraph}>
        Al acceder y utilizar la aplicación Cartitas la Aplicación, usted acepta estar 
        sujeto a estos Términos y Condiciones de Uso. Si no está de acuerdo con alguno de 
        estos términos, le rogamos que no utilice nuestra Aplicación. Nos reservamos el 
        derecho de modificar estos términos en cualquier momento, notificándole a través 
        de la Aplicación o por correo electrónico.
      </Text>

      <Text style={styles.heading}>2. Descripción del Servicio</Text>
      <Text style={styles.paragraph}>
        Cartitas es una plataforma social que permite a los usuarios conectarse, 
        compartir experiencias y enviar mensajes personalizados. Nuestros servicios incluyen 
        la creación de perfiles de usuario, el intercambio de contenido multimedia, 
        la geolocalización para conectar usuarios cercanos, y funcionalidades de mensajería 
        en tiempo real.
      </Text>

      <Text style={styles.heading}>3. Registro y Cuenta de Usuario</Text>
      <Text style={styles.paragraph}>
        Para utilizar la Aplicación, debe registrarse proporcionando información veraz, 
        precisa y actualizada. Usted es responsable de mantener la confidencialidad de 
        su contraseña y de todas las actividades que ocurran bajo su cuenta. Debe 
        notificarnos inmediatamente sobre cualquier uso no autorizado de su cuenta. 
        No se permite crear cuentas a menores de 18 años.
      </Text>

      <Text style={styles.heading}>4. Privacidad y Protección de Datos</Text>
      <Text style={styles.paragraph}>
        Recopilamos y procesamos sus datos personales de acuerdo con nuestra Política de 
        Privacidad. Esto incluye información de perfil, datos de ubicación (cuando se 
        activa la función de compartir ubicación), preferencias e intereses, y registros 
        de uso de la Aplicación. Tiene derecho a acceder, rectificar y eliminar sus datos 
        personales en cualquier momento desde la configuración de su cuenta.
      </Text>

      <Text style={styles.heading}>5. Uso de la Geolocalización</Text>
      <Text style={styles.paragraph}>
        La Aplicación puede solicitar acceso a su ubicación para conectarle con usuarios 
        cercanos. El uso de la geolocalización es opcional y puede desactivarse en cualquier 
        momento desde la configuración de su dispositivo. Sus coordenadas se almacenan de 
        forma segura y no se comparten con terceros sin su consentimiento explícito.
      </Text>

      <Text style={styles.heading}>6. Conducta del Usuario</Text>
      <Text style={styles.paragraph}>
        Usted se compromete a no utilizar la Aplicación para publicar contenido ofensivo, 
        discriminatorio o ilegal; acosar, intimidar o amenazar a otros usuarios; 
        suplantar la identidad de otras personas; distribuir spam o contenido publicitario 
        no autorizado; realizar actividades que puedan dañar la infraestructura técnica 
        de la Aplicación.
      </Text>

      <Text style={styles.heading}>7. Propiedad Intelectual</Text>
      <Text style={styles.paragraph}>
        Todo el contenido de la Aplicación, incluyendo diseño, logotipos, textos y código, 
        está protegido por derechos de propiedad intelectual. Al publicar contenido en la 
        Aplicación, usted nos otorga una licencia no exclusiva para usar, mostrar y 
        distribuir dicho contenido dentro de la plataforma. Usted conserva todos los 
        derechos sobre su contenido original.
      </Text>

      <Text style={styles.heading}>8. Limitación de Responsabilidad</Text>
      <Text style={styles.paragraph}>
        La Aplicación se proporciona tal cual sin garantías de ningún tipo. No nos 
        hacemos responsables de daños directos, indirectos, incidentales o consecuentes 
        que puedan derivarse del uso o la imposibilidad de uso de la Aplicación. 
        Hacemos nuestro mejor esfuerzo para garantizar la disponibilidad continua del 
        servicio, pero no podemos garantizar un funcionamiento ininterrumpido.
      </Text>

      <Text style={styles.heading}>9. Modificaciones y Terminación</Text>
      <Text style={styles.paragraph}>
        Podemos modificar o interrumpir el servicio en cualquier momento, con o sin previo 
        aviso. Podemos suspender o cancelar su cuenta si viola estos términos. Usted puede 
        cancelar su cuenta en cualquier momento desde la configuración. Tras la cancelación, 
        sus datos serán eliminados según lo establecido en nuestra Política de Privacidad.
      </Text>

      <Text style={styles.heading}>10. Ley Aplicable</Text>
      <Text style={styles.paragraph}>
        Estos términos se rigen por las leyes de la República de Colombia. Cualquier 
        disputa será resuelta ante los tribunales competentes de Bogotá, Colombia. 
        Si alguna disposición de estos términos resulta inválida, las demás disposiciones 
        continuarán en plena vigencia.
      </Text>

      <Text style={styles.lastUpdated}>Última actualización: Junio 2026</Text>
    </View>
  );
}

const styles = StyleSheet.create({
  content: { padding: 16 },
  heading: { fontSize: 16, fontWeight: '700', marginTop: 12, marginBottom: 6 },
  paragraph: { fontSize: 14, color: '#333', lineHeight: 20, marginBottom: 8 },
  lastUpdated: { marginTop: 12, fontSize: 12, color: '#666' },
});