import { useEffect, useState } from 'react';
import {
  Pressable,
  ScrollView,
  StyleSheet,
  Text,
  View,
} from 'react-native';

const weekdays = ['LU', 'MA', 'MI', 'JU', 'VI', 'SA', 'DO'];
const monthNames = [
  'enero',
  'febrero',
  'marzo',
  'abril',
  'mayo',
  'junio',
  'julio',
  'agosto',
  'septiembre',
  'octubre',
  'noviembre',
  'diciembre',
];

function sameDay(first, second) {
  return (
    first.getFullYear() === second.getFullYear() &&
    first.getMonth() === second.getMonth() &&
    first.getDate() === second.getDate()
  );
}

export default function Inicio({
  rooms,
  checkInDate,
  onCheckInDateChange,
  onOpenDisponibles,
  onOpenEnUso,
}) {
  const [today, setToday] = useState(() => new Date());
  const [visibleMonth, setVisibleMonth] = useState(
    () => new Date(today.getFullYear(), today.getMonth(), 1),
  );

  useEffect(() => {
    const timer = setInterval(() => setToday(new Date()), 60_000);
    return () => clearInterval(timer);
  }, []);

  const availableRooms = rooms.filter(
    (room) => room.status === 'available',
  ).length;
  const occupiedRooms = rooms.filter(
    (room) => room.status === 'occupied',
  ).length;
  const currentMonth = new Date(today.getFullYear(), today.getMonth(), 1);
  const canViewPreviousMonth = visibleMonth > currentMonth;
  const monthOffset = (visibleMonth.getDay() + 6) % 7;
  const daysInMonth = new Date(
    visibleMonth.getFullYear(),
    visibleMonth.getMonth() + 1,
    0,
  ).getDate();
  const calendarDays = [
    ...Array(monthOffset).fill(null),
    ...Array.from({ length: daysInMonth }, (_, index) => index + 1),
  ];

  function changeMonth(amount) {
    const nextMonth = new Date(
      visibleMonth.getFullYear(),
      visibleMonth.getMonth() + amount,
      1,
    );
    if (nextMonth < currentMonth) return;
    setVisibleMonth(nextMonth);
    onCheckInDateChange(
      nextMonth.getTime() === currentMonth.getTime() ? today : nextMonth,
    );
  }

  return (
    <ScrollView
      style={styles.screen}
      contentContainerStyle={styles.content}
      showsVerticalScrollIndicator={false}
    >
      <View style={styles.header}>
        <View style={styles.brandMark}>
          <Text style={styles.brandMarkText}>H</Text>
        </View>
        <View style={styles.headerText}>
          <Text style={styles.eyebrow}>BIENVENIDO</Text>
          <Text style={styles.title}>Encuentra tu estadía</Text>
        </View>
      </View>

      <View style={styles.welcomeCard}>
        <View style={styles.welcomeCopy}>
          <Text style={styles.welcomeEyebrow}>TU PRÓXIMA ESTADÍA</Text>
          <Text style={styles.welcomeTitle}>Descansa a tu manera</Text>
          <Text style={styles.welcomeDate}>
            Elige tu fecha de llegada y encuentra una habitación
          </Text>
        </View>
        <Text style={styles.welcomeIcon}>🌙</Text>
      </View>

      <View style={styles.sectionHeading}>
        <View>
          <Text style={styles.sectionTitle}>Disponibilidad</Text>
          <Text style={styles.sectionSubtitle}>Consulta el estado de las habitaciones</Text>
        </View>
      </View>

      <View style={styles.availabilityCards}>
        <Pressable
          accessibilityRole="button"
          accessibilityLabel={`${availableRooms} habitaciones disponibles. Toca para reservar`}
          onPress={onOpenDisponibles}
          style={[styles.availabilityCard, styles.availableCard]}
        >
          <Text style={styles.availabilityTitle}>Disponibles</Text>
          <Text style={[styles.availabilityCount, styles.availableCount]}>
            {availableRooms}
          </Text>
          <Text style={styles.availabilityDetail}>Toca para reservar</Text>
        </Pressable>

        <Pressable
          accessibilityRole="button"
          accessibilityLabel={`${occupiedRooms} habitaciones en uso`}
          onPress={onOpenEnUso}
          style={[styles.availabilityCard, styles.occupiedCard]}
        >
          <Text style={styles.availabilityTitle}>En uso</Text>
          <Text style={[styles.availabilityCount, styles.occupiedCount]}>
            {occupiedRooms}
          </Text>
          <Text style={styles.availabilityDetail}>Habitaciones ocupadas</Text>
        </Pressable>
      </View>

      <View style={styles.calendarCard}>
        <View style={styles.calendarHeader}>
          <View>
            <Text style={styles.sectionTitle}>Fecha de llegada</Text>
            <Text style={styles.sectionSubtitle}>Selecciona el día de entrada</Text>
          </View>
          <View style={styles.monthControls}>
            <Pressable
              accessibilityRole="button"
              accessibilityLabel="Mes anterior"
              accessibilityState={{ disabled: !canViewPreviousMonth }}
              disabled={!canViewPreviousMonth}
              onPress={() => changeMonth(-1)}
              style={[
                styles.monthButton,
                !canViewPreviousMonth && styles.disabledMonthButton,
              ]}
            >
              <Text style={styles.monthButtonText}>‹</Text>
            </Pressable>
            <Pressable
              accessibilityRole="button"
              accessibilityLabel="Mes siguiente"
              onPress={() => changeMonth(1)}
              style={styles.monthButton}
            >
              <Text style={styles.monthButtonText}>›</Text>
            </Pressable>
          </View>
        </View>

        <Text style={styles.monthTitle}>
          {monthNames[visibleMonth.getMonth()]} {visibleMonth.getFullYear()}
        </Text>

        <View style={styles.calendarGrid}>
          {weekdays.map((weekday) => (
            <Text key={weekday} style={styles.weekday}>
              {weekday}
            </Text>
          ))}
          {calendarDays.map((day, index) => {
            if (day === null) {
              return <View key={`empty-${index}`} style={styles.dayCell} />;
            }

            const date = new Date(
              visibleMonth.getFullYear(),
              visibleMonth.getMonth(),
              day,
            );
            const isToday = sameDay(date, today);
            const isSelected = sameDay(date, checkInDate);
            const isPast = date < new Date(
              today.getFullYear(),
              today.getMonth(),
              today.getDate(),
            );

            return (
              <Pressable
                key={day}
                accessibilityRole="button"
                accessibilityLabel={`${day} de ${monthNames[visibleMonth.getMonth()]} de ${visibleMonth.getFullYear()}`}
                accessibilityState={{ selected: isSelected }}
                disabled={isPast}
                onPress={() => onCheckInDateChange(date)}
                style={[
                  styles.dayCell,
                  isSelected && styles.selectedDayCell,
                  isToday && !isSelected && styles.todayCell,
                  isPast && styles.pastDayCell,
                ]}
              >
                <Text
                  style={[
                    styles.dayText,
                    isSelected && styles.selectedDayText,
                    isToday && !isSelected && styles.todayText,
                    isPast && styles.pastDayText,
                  ]}
                >
                  {day}
                </Text>
                {isToday && (
                  <View
                    style={[
                      styles.todayDot,
                      isSelected && styles.selectedTodayDot,
                    ]}
                  />
                )}
              </Pressable>
            );
          })}
        </View>

        <View style={styles.calendarFooter}>
          <View style={styles.todayLegend}>
            <View style={styles.legendDot} />
            <Text style={styles.calendarFooterText}>Hoy</Text>
          </View>
          <Text style={styles.calendarFooterText}>
            Entrada: {checkInDate.getDate()} de{' '}
            {monthNames[checkInDate.getMonth()]}
          </Text>
        </View>
      </View>

      <Text style={styles.disclaimer}>
        Disponibilidad de demostración. Las solicitudes no se envían al hotel.
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
    paddingTop: 18,
    paddingBottom: 36,
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 22,
  },
  brandMark: {
    width: 44,
    height: 44,
    borderRadius: 15,
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: '#173B3A',
  },
  brandMarkText: {
    color: '#FFFFFF',
    fontSize: 23,
    fontWeight: '800',
  },
  headerText: {
    flex: 1,
    marginLeft: 12,
  },
  eyebrow: {
    color: '#0f181a',
    fontSize: 10,
    fontWeight: '700',
    letterSpacing: 1.3,
  },
  title: {
    color: '#020c14',
    fontSize: 22,
    fontWeight: '800',
    marginTop: 2,
  },
  headerBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#107d50',
    borderRadius: 20,
    paddingHorizontal: 10,
    paddingVertical: 7,
  },
  onlineDot: {
    width: 7,
    height: 7,
    borderRadius: 4,
    backgroundColor: '#239B83',
    marginRight: 6,
  },
  headerBadgeText: {
    color: '#267B68',
    fontSize: 11,
    fontWeight: '700',
  },
  welcomeCard: {
    minHeight: 136,
    borderRadius: 22,
    backgroundColor: '#173B3A',
    padding: 20,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    overflow: 'hidden',
  },
  welcomeCopy: {
    flex: 1,
  },
  welcomeEyebrow: {
    color: '#B4D5C9',
    fontSize: 10,
    fontWeight: '700',
    letterSpacing: 1.3,
  },
  welcomeTitle: {
    color: '#FFFFFF',
    fontSize: 26,
    fontWeight: '800',
    marginTop: 8,
  },
  welcomeDate: {
    color: '#D5E4DE',
    fontSize: 12,
    marginTop: 5,
    textTransform: 'capitalize',
  },
  welcomeIcon: {
    color: '#E5BD7E',
    fontSize: 52,
    marginRight: 8,
  },
  sectionHeading: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginTop: 26,
    marginBottom: 13,
  },
  sectionTitle: {
    color: '#22313C',
    fontSize: 17,
    fontWeight: '800',
  },
  sectionSubtitle: {
    color: '#82909C',
    fontSize: 12,
    marginTop: 4,
  },
  demoBadge: {
    color: '#987047',
    backgroundColor: '#F5EBDD',
    borderRadius: 8,
    paddingHorizontal: 8,
    paddingVertical: 5,
    fontSize: 9,
    fontWeight: '800',
    letterSpacing: 0.7,
  },
  availabilityCards: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginTop: 2,
  },
  availabilityCard: {
    width: '48%',
    minHeight: 132,
    borderRadius: 16,
    backgroundColor: '#FFFFFF',
    paddingHorizontal: 15,
    paddingVertical: 14,
    borderLeftWidth: 4,
    shadowColor: '#22313C',
    shadowOffset: { width: 0, height: 3 },
    shadowOpacity: 0.05,
    shadowRadius: 8,
    elevation: 2,
  },
  availableCard: {
    borderLeftColor: '#239B83',
  },
  occupiedCard: {
    borderLeftColor: '#5575C9',
  },
  availabilityTitle: {
    color: '#34434E',
    fontSize: 14,
    fontWeight: '700',
  },
  availabilityCount: {
    fontSize: 29,
    fontWeight: '800',
    marginTop: 5,
  },
  availableCount: {
    color: '#239B83',
  },
  occupiedCount: {
    color: '#5575C9',
  },
  availabilityDetail: {
    color: '#82909C',
    fontSize: 11,
    marginTop: 3,
  },
  calendarCard: {
    marginTop: 24,
    borderRadius: 20,
    backgroundColor: '#FFFFFF',
    padding: 18,
    shadowColor: '#22313C',
    shadowOffset: { width: 0, height: 3 },
    shadowOpacity: 0.05,
    shadowRadius: 8,
    elevation: 2,
  },
  calendarHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
  },
  monthControls: {
    flexDirection: 'row',
  },
  monthButton: {
    width: 36,
    height: 36,
    borderRadius: 12,
    backgroundColor: '#F2F5F5',
    alignItems: 'center',
    justifyContent: 'center',
    marginLeft: 8,
  },
  monthButtonText: {
    color: '#315C57',
    fontSize: 27,
    lineHeight: 30,
  },
  disabledMonthButton: {
    opacity: 0.35,
  },
  monthTitle: {
    color: '#315C57',
    fontSize: 15,
    fontWeight: '800',
    textTransform: 'capitalize',
    marginTop: 19,
    marginBottom: 13,
  },
  calendarGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
  },
  weekday: {
    width: '14.2857%',
    textAlign: 'center',
    color: '#99A3AA',
    fontSize: 10,
    fontWeight: '800',
    paddingVertical: 8,
  },
  dayCell: {
    width: '14.2857%',
    height: 42,
    borderRadius: 12,
    alignItems: 'center',
    justifyContent: 'center',
  },
  dayText: {
    color: '#43515C',
    fontSize: 13,
    fontWeight: '600',
  },
  selectedDayCell: {
    backgroundColor: '#173B3A',
  },
  selectedDayText: {
    color: '#FFFFFF',
    fontWeight: '800',
  },
  todayCell: {
    borderWidth: 1,
    borderColor: '#239B83',
  },
  todayText: {
    color: '#187C68',
    fontWeight: '800',
  },
  pastDayCell: {
    opacity: 0.4,
  },
  pastDayText: {
    color: '#AEB6BC',
  },
  todayDot: {
    position: 'absolute',
    bottom: 4,
    width: 4,
    height: 4,
    borderRadius: 2,
    backgroundColor: '#239B83',
  },
  selectedTodayDot: {
    backgroundColor: '#E5BD7E',
  },
  calendarFooter: {
    borderTopWidth: 1,
    borderTopColor: '#EFF1F3',
    marginTop: 12,
    paddingTop: 13,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
  },
  todayLegend: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  legendDot: {
    width: 7,
    height: 7,
    borderRadius: 4,
    backgroundColor: '#239B83',
    marginRight: 6,
  },
  calendarFooterText: {
    color: '#77848E',
    fontSize: 11,
    textTransform: 'capitalize',
  },
  disclaimer: {
    color: '#929DA5',
    fontSize: 11,
    textAlign: 'center',
    marginTop: 16,
  },
});
