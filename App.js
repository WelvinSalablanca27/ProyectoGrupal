import { useState } from 'react';
import { StatusBar } from 'expo-status-bar';
import { Platform, Pressable, StyleSheet, Text, View } from 'react-native';
import Inicio from './src/screens/Inicio';
import CatalogoHabitacion from './src/screens/CatalogoHabitacion';
import Reservas from './src/components/Reservas';

const initialRooms = [
  { id: '1', status: 'occupied' },
  { id: '2', status: 'available' },
  { id: '3', status: 'available' },
  { id: '4', status: 'occupied' },
  { id: '5', status: 'available' },
  { id: '6', status: 'available' },
  { id: '7', status: 'maintenance' },
  { id: '8', status: 'available' },
  { id: '9', status: 'occupied' },
  { id: '10', status: 'available' },
  { id: '11', status: 'available' },
  { id: '12', status: 'available' },
  { id: '13', status: 'available' },
  { id: '14', status: 'available' },
  { id: '15', status: 'available' },
];

function TabIcon({ type, selected }) {
  const color = selected ? '#173B3A' : '#929DA5';

  if (type === 'home') {
    return (
      <View style={styles.homeIcon}>
        <View style={[styles.homeRoof, { borderColor: color }]} />
        <View style={[styles.homeBody, { borderColor: color }]}>
          <View style={[styles.homeDoor, { backgroundColor: color }]} />
        </View>
      </View>
    );
  }

  if (type === 'catalog') {
    return (
      <View style={[styles.bedIcon, { borderColor: color }]}>
        <View style={[styles.bedPillow, { borderColor: color }]} />
        <View style={[styles.bedMattress, { borderColor: color }]} />
        <View style={[styles.bedBase, { backgroundColor: color }]} />
      </View>
    );
  }

  return (
    <View style={[styles.calendarIcon, { borderColor: color }]}>
      <View style={[styles.calendarTop, { backgroundColor: color }]} />
      <View style={styles.calendarDots}>
        <View style={[styles.calendarDot, { backgroundColor: color }]} />
        <View style={[styles.calendarDot, { backgroundColor: color }]} />
        <View style={[styles.calendarDot, { backgroundColor: color }]} />
        <View style={[styles.calendarDot, { backgroundColor: color }]} />
      </View>
    </View>
  );
}

export default function App() {
  const [activeTab, setActiveTab] = useState('inicio');
  const [rooms, setRooms] = useState(initialRooms);
  const [reservations, setReservations] = useState([]);
  const [checkInDate, setCheckInDate] = useState(() => new Date());

  function reserveRoom(roomId, date, guest) {
    const roomIsAvailable = rooms.some(
      (room) => room.id === roomId && room.status === 'available',
    );
    if (!roomIsAvailable) return false;

    setRooms((currentRooms) =>
      currentRooms.map((room) =>
        room.id === roomId ? { ...room, status: 'reserved' } : room,
      ),
    );
    setReservations((currentReservations) => [
      {
        id: `${roomId}-${Date.now()}`,
        roomId,
        createdAt: new Date(),
        checkInDate: date,
        guest,
      },
      ...currentReservations,
    ]);
    return true;
  }

  function cancelReservation(reservationId) {
    const reservation = reservations.find((item) => item.id === reservationId);
    if (!reservation) return;

    setRooms((currentRooms) =>
      currentRooms.map((room) =>
        room.id === reservation.roomId
          ? { ...room, status: 'available' }
          : room,
      ),
    );
    setReservations((currentReservations) =>
      currentReservations.filter((item) => item.id !== reservationId),
    );
  }

  return (
    <View style={styles.app}>
      <StatusBar style="dark" />
      <View style={styles.screen}>
        {activeTab === 'inicio' ? (
          <Inicio
            rooms={rooms}
            checkInDate={checkInDate}
            onCheckInDateChange={setCheckInDate}
            onOpenDisponibles={() => setActiveTab('disponibles')}
            onOpenEnUso={() => setActiveTab('enUso')}
          />
        ) : activeTab === 'catalogo' ? (
          <CatalogoHabitacion />
        ) : (
          <Reservas
            rooms={rooms}
            reservations={reservations}
            checkInDate={checkInDate}
            roomFilter={activeTab}
            onReserveRoom={reserveRoom}
            onCancelReservation={cancelReservation}
          />
        )}
      </View>
      <View style={styles.tabBar}>
        <Pressable
          accessibilityRole="tab"
          accessibilityLabel="Inicio"
          accessibilityState={{ selected: activeTab === 'inicio' }}
          onPress={() => setActiveTab('inicio')}
          style={styles.tab}
        >
          <TabIcon type="home" selected={activeTab === 'inicio'} />
          <Text
            style={[
              styles.tabLabel,
              activeTab === 'inicio' && styles.selectedTabLabel,
            ]}
          >
            Inicio
          </Text>
        </Pressable>
        <Pressable
          accessibilityRole="tab"
          accessibilityLabel="Catálogo de habitaciones"
          accessibilityState={{ selected: activeTab === 'catalogo' }}
          onPress={() => setActiveTab('catalogo')}
          style={styles.tab}
        >
          <TabIcon type="catalog" selected={activeTab === 'catalogo'} />
          <Text
            style={[
              styles.tabLabel,
              activeTab === 'catalogo' && styles.selectedTabLabel,
            ]}
          >
            Catálogo
          </Text>
        </Pressable>
        <Pressable
          accessibilityRole="tab"
          accessibilityLabel="Habitaciones disponibles"
          accessibilityState={{ selected: activeTab === 'disponibles' }}
          onPress={() => setActiveTab('disponibles')}
          style={styles.tab}
        >
          <TabIcon type="calendar" selected={activeTab === 'disponibles'} />
          <Text
            style={[
              styles.tabLabel,
              activeTab === 'disponibles' && styles.selectedTabLabel,
            ]}
          >
            Reservas
          </Text>
        </Pressable>
        <Pressable
          accessibilityRole="tab"
          accessibilityLabel="Habitaciones en uso"
          accessibilityState={{ selected: activeTab === 'enUso' }}
          onPress={() => setActiveTab('enUso')}
          style={styles.tab}
        >
          <TabIcon type="calendar" selected={activeTab === 'enUso'} />
          <Text
            style={[
              styles.tabLabel,
              activeTab === 'enUso' && styles.selectedTabLabel,
            ]}
          >
            En uso
          </Text>
        </Pressable>
      </View>
    </View>
  );
}



const styles = StyleSheet.create({
  app: {
    flex: 1,
    backgroundColor: '#F4F6FA',
  },
  screen: {
    flex: 1,
  },
  tabBar: {
    minHeight: 120,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-around',
    backgroundColor: '#FFFFFF',
    borderTopWidth: 1,
    borderTopColor: '#E9ECEF',
    paddingBottom: 10,
    paddingTop: 8,
    marginBottom: Platform.OS === 'web' ? 0 : 8,
  },
  tab: {
    flex: 1,
    minHeight: 50,
    alignItems: 'center',
    justifyContent: 'center',
    gap: 5,
  },
  tabLabel: {
    color: '#929DA5',
    fontSize: 11,
    fontWeight: '600',
  },
  selectedTabLabel: {
    color: '#173B3A',
    fontWeight: '800',
  },
  homeIcon: {
    width: 23,
    height: 23,
    alignItems: 'center',
    justifyContent: 'flex-end',
  },
  homeRoof: {
    position: 'absolute',
    top: 3,
    width: 13,
    height: 13,
    borderLeftWidth: 2,
    borderTopWidth: 2,
    transform: [{ rotate: '45deg' }],
  },
  homeBody: {
    width: 15,
    height: 12,
    borderWidth: 2,
    borderTopWidth: 0,
    alignItems: 'center',
    justifyContent: 'flex-end',
  },
  homeDoor: {
    width: 4,
    height: 7,
    borderTopLeftRadius: 2,
    borderTopRightRadius: 2,
  },
  calendarIcon: {
    width: 21,
    height: 20,
    borderWidth: 2,
    borderRadius: 5,
    overflow: 'hidden',
    padding: 3,
  },
  bedIcon: {
    width: 23,
    height: 20,
    justifyContent: 'flex-end',
    borderLeftWidth: 2,
    borderBottomWidth: 2,
    borderRightWidth: 2,
    borderBottomLeftRadius: 2,
    borderBottomRightRadius: 2,
    paddingHorizontal: 2,
    paddingBottom: 3,
  },
  bedPillow: {
    position: 'absolute',
    top: 4,
    left: 3,
    width: 6,
    height: 5,
    borderWidth: 1.5,
    borderRadius: 2,
  },
  bedMattress: {
    height: 7,
    borderWidth: 1.5,
    borderTopLeftRadius: 3,
    borderTopRightRadius: 3,
  },
  bedBase: {
    height: 2,
    marginTop: 2,
  },
  calendarTop: {
    height: 3,
    marginHorizontal: -3,
    marginTop: -3,
    marginBottom: 4,
  },
  calendarDots: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    justifyContent: 'space-between',
    rowGap: 3,
  },
  calendarDot: {
    width: 4,
    height: 3,
    borderRadius: 1,
  },
});
