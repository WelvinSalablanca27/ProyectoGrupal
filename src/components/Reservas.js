import { useState } from 'react';
import {
  KeyboardAvoidingView,
  Modal,
  Platform,
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

function formatDateInput(date) {
  const year = date.getFullYear();
  const month = `${date.getMonth() + 1}`.padStart(2, '0');
  const day = `${date.getDate()}`.padStart(2, '0');
  return `${year}-${month}-${day}`;
}

function parseDateInput(value) {
  const match = /^(\d{4})-(\d{2})-(\d{2})$/.exec(value);
  if (!match) return null;

  const year = Number(match[1]);
  const month = Number(match[2]);
  const day = Number(match[3]);
  const date = new Date(year, month - 1, day);
  if (
    date.getFullYear() !== year ||
    date.getMonth() !== month - 1 ||
    date.getDate() !== day
  ) {
    return null;
  }
  return date;
}

function RoomRow({ room, reservation, onPress }) {
  const statusLabel = reservation
    ? `Reserva · ${reservation.checkInDate.toLocaleDateString('es')} – ${reservation.checkOutDate.toLocaleDateString('es')}`
    : room.status === 'occupied'
      ? 'En uso'
      : room.status === 'maintenance'
        ? 'Mantenimiento'
        : 'Disponible';

  return (
    <View style={styles.roomRow}>
      <View style={styles.roomInfo}>
        <View
          style={[
            styles.roomIcon,
            room.status === 'occupied' && styles.occupiedRoomIcon,
            room.status === 'maintenance' && styles.maintenanceRoomIcon,
          ]}
        >
          <Text
            style={[
              styles.roomIconText,
              room.status === 'occupied' && styles.occupiedRoomIconText,
              room.status === 'maintenance' && styles.maintenanceRoomIconText,
            ]}
          >
            H
          </Text>
        </View>
        <View>
          <Text style={styles.roomName}>Habitación {room.id}</Text>
          <Text style={styles.roomStatus}>{statusLabel}</Text>
        </View>
      </View>

      {onPress && (room.status === 'available' || reservation) ? (
        <Pressable
          accessibilityRole="button"
          accessibilityLabel={
            reservation
              ? `Cancelar reserva de la habitación ${room.id}`
              : `Hacer reserva de la habitación ${room.id}`
          }
          onPress={onPress}
          style={[
            styles.actionButton,
            reservation && styles.cancelButton,
          ]}
        >
          <Text
            style={[
              styles.actionButtonText,
              reservation && styles.cancelButtonText,
            ]}
          >
            {reservation ? 'Cancelar' : 'Hacer reserva'}
          </Text>
        </Pressable>
      ) : null}
    </View>
  );
}

export default function Reservas({
  rooms,
  reservations,
  checkInDate,
  roomFilter,
  onReserveRoom,
  onCancelReservation,
}) {
  const [selectedRoomId, setSelectedRoomId] = useState(null);
  const [guest, setGuest] = useState(emptyGuest);
  const [formError, setFormError] = useState('');
  const [checkIn, setCheckIn] = useState(formatDateInput(checkInDate));
  const [checkOut, setCheckOut] = useState(() => {
    const nextDay = new Date(checkInDate);
    nextDay.setDate(nextDay.getDate() + 1);
    return formatDateInput(nextDay);
  });
  const availableRooms = rooms.filter((room) => room.status === 'available');
  const occupiedRooms = rooms.filter((room) => room.status === 'occupied');
  const showingBooking = roomFilter === 'reservas';
  const showingAvailable = roomFilter === 'disponibles' || showingBooking;
  const filteredRooms = showingAvailable
    ? availableRooms
    : roomFilter === 'enUso'
      ? occupiedRooms
      : [];

  function openReservationForm(roomId) {
    setSelectedRoomId(roomId);
    setGuest(emptyGuest);
    setFormError('');
    setCheckIn(formatDateInput(checkInDate));
    const nextDay = new Date(checkInDate);
    nextDay.setDate(nextDay.getDate() + 1);
    setCheckOut(formatDateInput(nextDay));
  }

  function closeReservationForm() {
    setSelectedRoomId(null);
    setGuest(emptyGuest);
    setFormError('');
  }

  function submitReservation() {
    const checkInDateValue = parseDateInput(checkIn.trim());
    const checkOutDateValue = parseDateInput(checkOut.trim());
    if (!checkInDateValue || !checkOutDateValue) {
      setFormError('Ingresa las fechas en formato AAAA-MM-DD.');
      return;
    }
    if (checkOutDateValue <= checkInDateValue) {
      setFormError('La fecha de salida debe ser posterior a la fecha de entrada.');
      return;
    }

    const missingField = guestFields.find(
      (field) => field.required && !guest[field.name].trim(),
    );
    if (missingField) {
      setFormError(`Completa el campo “${missingField.label}”.`);
      return;
    }

    const saved = onReserveRoom(selectedRoomId, checkInDateValue, checkOutDateValue, {
      primer_nombre: guest.primer_nombre.trim(),
      segundo_nombre: guest.segundo_nombre.trim(),
      primer_apellido: guest.primer_apellido.trim(),
      segundo_apellido: guest.segundo_apellido.trim(),
      cedula_pasaporte: guest.cedula_pasaporte.trim(),
      lugar_origen: guest.lugar_origen.trim(),
    });

    if (!saved) {
      setFormError('Esta habitación ya no está disponible. Elige otra.');
      return;
    }
    closeReservationForm();
  }

  return (
    <>
      <ScrollView
        style={styles.screen}
        contentContainerStyle={styles.content}
        showsVerticalScrollIndicator={false}
      >
        <View style={styles.header}>
          <Text style={styles.eyebrow}>
            {showingBooking ? 'RESERVA PARA EL CLIENTE' : 'PLANIFICA TU ESTADÍA'}
          </Text>
          <Text style={styles.title}>
            {showingBooking
              ? 'Reserva tu habitación'
              : showingAvailable
                ? 'Habitaciones disponibles'
                : 'Habitaciones en uso'}
          </Text>
          <Text style={styles.subtitle}>
            {showingBooking
              ? 'Elige una habitación disponible y toca “Reservar” para completar tus datos.'
              : showingAvailable
                ? 'Selecciona una habitación libre y completa tus datos para solicitarla.'
                : 'Consulta las habitaciones que actualmente están ocupadas.'}
          </Text>
        </View>

        <View style={styles.summaryCard}>
          <View>
            <Text style={styles.cardLabel}>
              {showingBooking
                ? 'Habitaciones para reservar'
                : showingAvailable
                  ? 'Disponibles para tu estadía'
                  : 'Habitaciones en uso'}
            </Text>
            {showingAvailable && (
              <Text style={styles.cardHint}>
                Llegada: {checkInDate.toLocaleDateString('es')}
              </Text>
            )}
          </View>
          <Text style={styles.count}>{filteredRooms.length}</Text>
        </View>

        {showingBooking ? (
          <>
            <Text style={styles.sectionTitle}>
              Habitaciones disponibles ({availableRooms.length})
            </Text>
            {availableRooms.length > 0 ? (
              <View style={styles.listCard}>
                {availableRooms.map((room) => (
                  <RoomRow
                    key={room.id}
                    room={room}
                    onPress={() => openReservationForm(room.id)}
                  />
                ))}
              </View>
            ) : (
              <View style={styles.emptyCard}>
                <Text style={styles.emptyTitle}>No hay habitaciones disponibles</Text>
                <Text style={styles.emptyDescription}>
                  Cuando haya una habitación libre, podrás reservarla aquí.
                </Text>
              </View>
            )}
          </>
        ) : (
          <>
            <Text style={styles.sectionTitle}>
              {showingAvailable
                ? `Disponibles (${filteredRooms.length})`
                : `En uso (${filteredRooms.length})`}
            </Text>
            {filteredRooms.length > 0 ? (
              <View style={styles.listCard}>
                {filteredRooms.map((room) => {
                  const reservation = reservations.find(
                    (item) => item.roomId === room.id,
                  );
                  return (
                    <RoomRow
                      key={room.id}
                      room={room}
                      reservation={reservation}
                      onPress={
                        showingAvailable
                          ? () => openReservationForm(room.id)
                          : undefined
                      }
                    />
                  );
                })}
              </View>
            ) : (
              <View style={styles.emptyCard}>
                <Text style={styles.emptyTitle}>
                  {showingAvailable
                    ? 'No hay habitaciones disponibles'
                    : 'No hay habitaciones en uso'}
                </Text>
                <Text style={styles.emptyDescription}>
                  {showingAvailable
                    ? 'Cuando una habitación quede libre, podrás solicitarla aquí.'
                    : 'Por ahora, todas las habitaciones están libres.'}
                </Text>
              </View>
            )}
          </>
        )}

        {showingBooking && reservations.length > 0 && (
          <>
            <Text style={styles.sectionTitle}>Mis reservas</Text>
            <View style={styles.listCard}>
              {reservations.map((reservation) => {
                const room = rooms.find((item) => item.id === reservation.roomId);
                if (!room) return null;

                return (
                  <RoomRow
                    key={reservation.id}
                    room={room}
                    reservation={reservation}
                    onPress={() => onCancelReservation(reservation.id)}
                  />
                );
              })}
            </View>
          </>
        )}

        <Text style={styles.disclaimer}>
          Demo: los datos se guardan solo mientras la aplicación está abierta y no se envían al hotel.
        </Text>
      </ScrollView>

      <Modal
        visible={selectedRoomId !== null}
        animationType="slide"
        onRequestClose={closeReservationForm}
      >
        <KeyboardAvoidingView
          style={styles.modalScreen}
          behavior={Platform.OS === 'ios' ? 'padding' : undefined}
        >
          <ScrollView
            contentContainerStyle={styles.modalContent}
            keyboardShouldPersistTaps="handled"
          >
            <Text style={styles.eyebrow}>SOLICITUD DE RESERVA</Text>
            <Text style={styles.modalTitle}>Habitación {selectedRoomId}</Text>
            <Text style={styles.formIntro}>
              Completa tus datos para solicitar esta habitación.
            </Text>

            <View style={styles.inputGroup}>
              <Text style={styles.inputLabel}>Fecha de entrada</Text>
              <TextInput
                accessibilityLabel="Fecha de entrada"
                onChangeText={setCheckIn}
                placeholder="AAAA-MM-DD"
                placeholderTextColor="#9AA4AC"
                style={styles.textInput}
                value={checkIn}
              />
            </View>
            <View style={styles.inputGroup}>
              <Text style={styles.inputLabel}>Fecha de salida</Text>
              <TextInput
                accessibilityLabel="Fecha de salida"
                onChangeText={setCheckOut}
                placeholder="AAAA-MM-DD"
                placeholderTextColor="#9AA4AC"
                style={styles.textInput}
                value={checkOut}
              />
            </View>

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
                  onChangeText={(value) =>
                    setGuest((currentGuest) => ({
                      ...currentGuest,
                      [field.name]: value,
                    }))
                  }
                  placeholder={field.label}
                  placeholderTextColor="#9AA4AC"
                  style={styles.textInput}
                  value={guest[field.name]}
                />
              </View>
            ))}

            {formError ? <Text style={styles.formError}>{formError}</Text> : null}

            <Pressable
              accessibilityRole="button"
              onPress={submitReservation}
              style={styles.submitButton}
            >
              <Text style={styles.submitButtonText}>Confirmar reserva</Text>
            </Pressable>
            <Pressable
              accessibilityRole="button"
              onPress={closeReservationForm}
              style={styles.closeButton}
            >
              <Text style={styles.closeButtonText}>Volver</Text>
            </Pressable>
            <Text style={styles.formDisclaimer}>
              Esta demostración no envía tus datos al hotel.
            </Text>
          </ScrollView>
        </KeyboardAvoidingView>
      </Modal>
    </>
  );
}

const styles = StyleSheet.create({
  screen: {
    flex: 1,
    backgroundColor: '#F4F6FA',
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
    color: '#5F6E76',
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
    color: '#5F6E76',
    fontSize: 14,
    lineHeight: 20,
  },
  summaryCard: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    backgroundColor: '#FFFFFF',
    borderRadius: 18,
    paddingHorizontal: 18,
    paddingVertical: 16,
    marginBottom: 20,
    shadowColor: '#000',
    shadowOpacity: 0.04,
    shadowRadius: 10,
    shadowOffset: { width: 0, height: 4 },
    elevation: 2,
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
  sectionTitle: {
    color: '#22313C',
    fontSize: 16,
    fontWeight: '800',
    marginTop: 24,
    marginBottom: 11,
  },
  listCard: {
    backgroundColor: '#FFFFFF',
    borderRadius: 16,
    paddingHorizontal: 14,
  },
  roomRow: {
    minHeight: 70,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    borderBottomWidth: 1,
    borderBottomColor: '#EFF1F3',
  },
  roomInfo: {
    flexDirection: 'row',
    alignItems: 'center',
    flex: 1,
    marginRight: 10,
  },
  roomIcon: {
    width: 40,
    height: 40,
    borderRadius: 13,
    backgroundColor: '#EAF3F0',
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: 11,
  },
  roomIconText: {
    color: '#239B83',
    fontSize: 18,
    fontWeight: '800',
  },
  occupiedRoomIcon: {
    backgroundColor: '#EEF0FA',
  },
  occupiedRoomIconText: {
    color: '#5575C9',
  },
  maintenanceRoomIcon: {
    backgroundColor: '#F8F1EA',
  },
  maintenanceRoomIconText: {
    color: '#D28A3A',
  },
  roomName: {
    color: '#34434E',
    fontSize: 13,
    fontWeight: '700',
  },
  roomStatus: {
    color: '#82909C',
    fontSize: 11,
    marginTop: 4,
  },
  actionButton: {
    backgroundColor: '#173B3A',
    borderRadius: 10,
    paddingHorizontal: 13,
    paddingVertical: 9,
  },
  actionButtonText: {
    color: '#FFFFFF',
    fontSize: 11,
    fontWeight: '700',
  },
  cancelButton: {
    backgroundColor: '#FBEDEC',
  },
  cancelButtonText: {
    color: '#B54C45',
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
    textAlign: 'center',
    marginTop: 16,
  },
  modalScreen: {
    flex: 1,
    backgroundColor: '#F4F6FA',
  },
  modalContent: {
    paddingHorizontal: 22,
    paddingTop: 34,
    paddingBottom: 36,
  },
  modalTitle: {
    color: '#1F2D38',
    fontSize: 25,
    fontWeight: '800',
    marginTop: 7,
  },
  formIntro: {
    color: '#52616B',
    fontSize: 14,
    lineHeight: 20,
    marginTop: 22,
  },
  inputGroup: {
    marginTop: 18,
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
  formError: {
    color: '#B54C45',
    fontSize: 12,
    fontWeight: '700',
    marginTop: 14,
  },
  submitButton: {
    backgroundColor: '#173B3A',
    borderRadius: 12,
    paddingVertical: 12,
    alignItems: 'center',
    marginTop: 20,
  },
  submitButtonText: {
    color: '#FFFFFF',
    fontSize: 14,
    fontWeight: '700',
  },
  closeButton: {
    backgroundColor: '#EAF3F0',
    borderRadius: 12,
    paddingVertical: 12,
    alignItems: 'center',
    marginTop: 12,
  },
  closeButtonText: {
    color: '#173B3A',
    fontSize: 14,
    fontWeight: '700',
  },
  formDisclaimer: {
    color: '#8A949A',
    fontSize: 11,
    textAlign: 'center',
    marginTop: 14,
  },
});
