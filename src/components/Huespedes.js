import { useState } from 'react';
import {
  Pressable,
  ScrollView,
  StyleSheet,
  Text,
  TextInput,
  View,
} from 'react-native';

const emptyGuest = {
  primer_nombre: '',
  segundo_nombre: '',
  primer_apellido: '',
  segundo_apellido: '',
  cedula_pasaporte: '',
  lugar_origen: '',
};

const guestFields = [
  { name: 'primer_nombre', label: 'Primer nombre', required: true },
  { name: 'segundo_nombre', label: 'Segundo nombre', required: false },
  { name: 'primer_apellido', label: 'Primer apellido', required: true },
  { name: 'segundo_apellido', label: 'Segundo apellido', required: false },
  { name: 'cedula_pasaporte', label: 'Cédula o pasaporte', required: true },
  { name: 'lugar_origen', label: 'Lugar de origen', required: true },
];

function guestName(guest) {
  return [
    guest.primer_nombre,
    guest.segundo_nombre,
    guest.primer_apellido,
    guest.segundo_apellido,
  ]
    .filter(Boolean)
    .join(' ');
}

function formatNicaraguanId(value) {
  const compactValue = value.toUpperCase().replace(/[-\s]/g, '');
  const checkLetter = /[A-Z]$/.test(compactValue) ? compactValue.slice(-1) : '';
  const digits = compactValue.replace(/\D/g, '').slice(0, 13);
  let formattedValue = digits.slice(0, 3);

  if (digits.length > 3) {
    formattedValue += `-${digits.slice(3, 9)}`;
  }
  if (digits.length > 9) {
    formattedValue += `-${digits.slice(9)}`;
  }

  return formattedValue + checkLetter;
}

export default function Huespedes({ guests, onRegisterGuest }) {
  const [guest, setGuest] = useState(emptyGuest);
  const [formMessage, setFormMessage] = useState(null);

  function submitGuest() {
    const normalizedGuest = Object.fromEntries(
      Object.entries(guest).map(([field, value]) => [field, value.trim()]),
    );
    const missingField = guestFields.find(
      (field) => field.required && !normalizedGuest[field.name],
    );

    if (missingField) {
      setFormMessage({
        type: 'error',
        text: `Completa el campo “${missingField.label}”.`,
      });
      return;
    }

    const documentNumber = normalizedGuest.cedula_pasaporte.toLocaleLowerCase();
    const alreadyRegistered = guests.some(
      (registeredGuest) =>
        registeredGuest.cedula_pasaporte.toLocaleLowerCase() === documentNumber,
    );

    if (alreadyRegistered) {
      setFormMessage({
        type: 'error',
        text: 'Ya existe un huésped registrado con ese documento.',
      });
      return;
    }

    onRegisterGuest(normalizedGuest);
    setGuest(emptyGuest);
    setFormMessage({
      type: 'success',
      text: 'El huésped se registró correctamente.',
    });
  }

  return (
    <ScrollView
      style={styles.screen}
      contentContainerStyle={styles.content}
      keyboardShouldPersistTaps="handled"
      showsVerticalScrollIndicator={false}
    >
      <View style={styles.header}>
        <Text style={styles.eyebrow}>GESTIÓN DEL HOTEL</Text>
        <Text style={styles.title}>Registrar huésped</Text>
        <Text style={styles.subtitle}>
          Ingresa los datos de identificación del nuevo huésped.
        </Text>
      </View>

      <View style={styles.summaryCard}>
        <View>
          <Text style={styles.cardLabel}>Huéspedes registrados</Text>
          <Text style={styles.cardHint}>Registros de esta sesión</Text>
        </View>
        <Text style={styles.count}>{guests.length}</Text>
      </View>

      <View style={styles.formCard}>
        <Text style={styles.sectionTitle}>Datos personales</Text>
        <Text style={styles.formIntro}>
          Los campos marcados como obligatorios son necesarios para guardar el registro.
        </Text>

        {guestFields.map((field) => (
          <View key={field.name} style={styles.inputGroup}>
            <Text style={styles.inputLabel}>
              {field.label}
              {field.required ? ' (obligatorio)' : ' (opcional)'}
            </Text>
            <TextInput
              accessibilityLabel={field.label}
              autoCapitalize={
                field.name === 'cedula_pasaporte' ? 'characters' : 'words'
              }
              autoCorrect={false}
              maxLength={field.name === 'cedula_pasaporte' ? 16 : undefined}
              onChangeText={(value) => {
                const formattedValue =
                  field.name === 'cedula_pasaporte'
                    ? formatNicaraguanId(value)
                    : value;
                setGuest((currentGuest) => ({
                  ...currentGuest,
                  [field.name]: formattedValue,
                }));
                setFormMessage(null);
              }}
              placeholder={field.label}
              placeholderTextColor="#9AA4AC"
              style={styles.textInput}
              value={guest[field.name]}
            />
          </View>
        ))}

        {formMessage ? (
          <Text
            accessibilityLiveRegion="polite"
            style={[
              styles.formMessage,
              formMessage.type === 'success'
                ? styles.successMessage
                : styles.errorMessage,
            ]}
          >
            {formMessage.text}
          </Text>
        ) : null}

        <Pressable
          accessibilityRole="button"
          onPress={submitGuest}
          style={styles.submitButton}
        >
          <Text style={styles.submitButtonText}>Registrar huésped</Text>
        </Pressable>
      </View>

      <Text style={styles.sectionTitle}>Huéspedes registrados ({guests.length})</Text>
      {guests.length > 0 ? (
        <View style={styles.listCard}>
          {guests.map((registeredGuest) => (
            <View key={registeredGuest.id} style={styles.guestRow}>
              <View style={styles.avatar}>
                <Text style={styles.avatarText}>
                  {registeredGuest.primer_nombre.charAt(0).toUpperCase()}
                </Text>
              </View>
              <View style={styles.guestDetails}>
                <Text style={styles.guestName}>{guestName(registeredGuest)}</Text>
                <Text style={styles.guestInfo}>
                  {registeredGuest.cedula_pasaporte}
                </Text>
                <Text style={styles.guestInfo}>{registeredGuest.lugar_origen}</Text>
              </View>
            </View>
          ))}
        </View>
      ) : (
        <View style={styles.emptyCard}>
          <Text style={styles.emptyTitle}>Aún no hay huéspedes registrados</Text>
          <Text style={styles.emptyDescription}>
            Completa el formulario para agregar el primer huésped.
          </Text>
        </View>
      )}

      <Text style={styles.disclaimer}>
        Demo: los registros se conservan solo mientras la aplicación está abierta.
      </Text>
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  screen: {
    flex: 1,
    backgroundColor: '#4492c0',
  },
  content: {
    paddingHorizontal: 20,
    paddingTop: 24,
    paddingBottom: 32,
  },
  header: {
    marginBottom: 18,
  },
  eyebrow: {
    color: '#080808',
    fontSize: 12,
    fontWeight: '800',
    letterSpacing: 1.2,
    marginBottom: 6,
  },
  title: {
    color: '#1D2A2F',
    fontSize: 28,
    fontWeight: '800',
    marginBottom: 6,
  },
  subtitle: {
    color: '#0b0c0c',
    fontSize: 14,
    lineHeight: 20,
  },
  summaryCard: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    backgroundColor: '#ffffff',
    borderRadius: 18,
    paddingHorizontal: 18,
    paddingVertical: 16,
    marginBottom: 20,
  },
  cardLabel: {
    color: '#5F6E76',
    fontSize: 12,
    fontWeight: '700',
  },
  cardHint: {
    color: '#8A949A',
    fontSize: 11,
    marginTop: 4,
  },
  count: {
    color: '#239B83',
    fontSize: 30,
    fontWeight: '800',
  },
  formCard: {
    backgroundColor: '#ffffff',
    borderRadius: 16,
    padding: 18,
  },
  sectionTitle: {
    color: '#22313C',
    fontSize: 16,
    fontWeight: '800',
    marginTop: 24,
    marginBottom: 11,
  },
  formIntro: {
    color: '#070708',
    fontSize: 12,
    lineHeight: 18,
    marginTop: 8,
  },
  inputGroup: {
    marginTop: 16,
  },
  inputLabel: {
    color: '#455763',
    fontSize: 12,
    fontWeight: '700',
    marginBottom: 8,
  },
  textInput: {
    backgroundColor: '#FFFFFF',
    borderColor: '#D9E0E6',
    borderRadius: 12,
    borderWidth: 1,
    color: '#1D2A2F',
    fontSize: 14,
    paddingHorizontal: 14,
    paddingVertical: 12,
  },
  formMessage: {
    fontSize: 12,
    fontWeight: '700',
    lineHeight: 18,
    marginTop: 14,
  },
  errorMessage: {
    color: '#B54C45',
  },
  successMessage: {
    color: '#21846F',
  },
  submitButton: {
    backgroundColor: '#173B3A',
    borderRadius: 12,
    alignItems: 'center',
    marginTop: 20,
    paddingVertical: 13,
  },
  submitButtonText: {
    color: '#FFFFFF',
    fontSize: 14,
    fontWeight: '700',
  },
  listCard: {
    backgroundColor: '#FFFFFF',
    borderRadius: 16,
    paddingHorizontal: 14,
  },
  guestRow: {
    minHeight: 78,
    flexDirection: 'row',
    alignItems: 'center',
    borderBottomColor: '#EFF1F3',
    borderBottomWidth: 1,
    paddingVertical: 12,
  },
  avatar: {
    width: 42,
    height: 42,
    borderRadius: 21,
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: '#EAF3F0',
    marginRight: 12,
  },
  avatarText: {
    color: '#239B83',
    fontSize: 16,
    fontWeight: '800',
  },
  guestDetails: {
    flex: 1,
  },
  guestName: {
    color: '#34434E',
    fontSize: 14,
    fontWeight: '700',
  },
  guestInfo: {
    color: '#82909C',
    fontSize: 12,
    marginTop: 4,
  },
  emptyCard: {
    alignItems: 'center',
    backgroundColor: '#FFFFFF',
    borderRadius: 16,
    paddingHorizontal: 20,
    paddingVertical: 24,
  },
  emptyTitle: {
    color: '#22313C',
    fontSize: 14,
    fontWeight: '800',
    textAlign: 'center',
  },
  emptyDescription: {
    color: '#82909C',
    fontSize: 12,
    lineHeight: 18,
    marginTop: 7,
    textAlign: 'center',
  },
  disclaimer: {
    color: '#929DA5',
    fontSize: 11,
    marginTop: 16,
    textAlign: 'center',
  },
});