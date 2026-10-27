
import React, { useState } from 'react';
import {
  Alert,
  Image,
  Modal,
  Platform,
  Pressable,
  ScrollView,
  StyleSheet,
  Text,
  TextInput,
  View,
} from 'react-native';

import { Picker } from '@react-native-picker/picker';
import DateTimePicker, {
  DateTimePickerAndroid,
} from '@react-native-community/datetimepicker';

const tiposHabitacion = [
  {
    nombre: 'Suite Presidencial',
    precio: 120,
    capacidad: 4,
    camas: '2 camas King',
    imagen:
      'https://images.unsplash.com/photo-1611892440504-42a792e24d32?auto=format&fit=crop&w=900&q=80',
    servicios: 'Wi-Fi · Aire acondicionado · Balcón',
  },
  {
    nombre: 'Habitación Familiar',
    precio: 95,
    capacidad: 5,
    camas: '2 camas Queen',
    imagen:
      'https://images.unsplash.com/photo-1566665797739-1674de7a421a?auto=format&fit=crop&w=900&q=80',
    servicios: 'Wi-Fi · Aire acondicionado · Vista',
  },
  {
    nombre: 'Habitación Doble',
    precio: 60,
    capacidad: 2,
    camas: '1 cama matrimonial',
    imagen:
      'https://images.unsplash.com/photo-1616594039964-ae9021a400a0?auto=format&fit=crop&w=900&q=80',
    servicios: 'Wi-Fi · Aire acondicionado',
  },
];

const habitaciones = Array.from({ length: 15 }, (_, index) => ({
  ...tiposHabitacion[index % tiposHabitacion.length],
  numero: index + 1,
}));

function inicioDelDia(fecha = new Date()) {
  const copia = new Date(fecha);
  copia.setHours(0, 0, 0, 0);
  return copia;
}

function fechaConTiempoActual(diasAdicionales = 0) {
  const fecha = new Date();
  fecha.setSeconds(0, 0);
  fecha.setDate(fecha.getDate() + diasAdicionales);
  return fecha;
}

function fechaTexto(fecha) {
  const dia = String(fecha.getDate()).padStart(2, '0');
  const mes = String(fecha.getMonth() + 1).padStart(2, '0');
  return `${dia}/${mes}/${fecha.getFullYear()}`;
}

function fechaISO(fecha) {
  const mes = String(fecha.getMonth() + 1).padStart(2, '0');
  const dia = String(fecha.getDate()).padStart(2, '0');
  return `${fecha.getFullYear()}-${mes}-${dia}`;
}

function horaISO(fecha) {
  const hora = String(fecha.getHours()).padStart(2, '0');
  const minuto = String(fecha.getMinutes()).padStart(2, '0');
  return `${hora}:${minuto}`;
}

function horaTexto(fecha) {
  return fecha.toLocaleTimeString('es', {
    hour: '2-digit',
    minute: '2-digit',
  });
}

export default function CatalogoHabitacion() {
  const [busqueda, setBusqueda] = useState('');
  const [habitacionSeleccionada, setHabitacionSeleccionada] =
    useState(null);

  const [nombreHuesped, setNombreHuesped] = useState('');
  const [segundoNombreHuesped, setSegundoNombreHuesped] =
    useState('');
  const [apellidoHuesped, setApellidoHuesped] = useState('');
  const [segundoApellidoHuesped, setSegundoApellidoHuesped] =
    useState('');

  const [tipoDocumento, setTipoDocumento] = useState('cedula');
  const [numeroDocumento, setNumeroDocumento] = useState('');

  const [fechaEntrada, setFechaEntrada] = useState(
    fechaConTiempoActual
  );
  const [fechaSalida, setFechaSalida] = useState(() =>
    fechaConTiempoActual(1)
  );

  const [cantidadHuespedes, setCantidadHuespedes] = useState('1');

  const [mostrarEntradaIOS, setMostrarEntradaIOS] = useState(false);
  const [mostrarSalidaIOS, setMostrarSalidaIOS] = useState(false);
  const [mostrarHoraEntradaIOS, setMostrarHoraEntradaIOS] =
    useState(false);
  const [mostrarHoraSalidaIOS, setMostrarHoraSalidaIOS] =
    useState(false);

  const habitacionesFiltradas = habitaciones.filter((habitacion) =>
    `habitación ${habitacion.numero} ${habitacion.nombre}`
      .toLowerCase()
      .includes(busqueda.trim().toLowerCase())
  );

  function abrirReserva(habitacion) {
    const hoy = fechaConTiempoActual();
    const manana = new Date(hoy);
    manana.setDate(manana.getDate() + 1);

    setNombreHuesped('');
    setSegundoNombreHuesped('');
    setApellidoHuesped('');
    setSegundoApellidoHuesped('');

    setTipoDocumento('cedula');
    setNumeroDocumento('');

    setFechaEntrada(hoy);
    setFechaSalida(manana);

    setCantidadHuespedes('1');
    setMostrarEntradaIOS(false);
    setMostrarSalidaIOS(false);
    setMostrarHoraEntradaIOS(false);
    setMostrarHoraSalidaIOS(false);

    setHabitacionSeleccionada(habitacion);
  }

  function abrirCalendario(tipo) {
    const esEntrada = tipo === 'entrada';

    const valorActual = esEntrada ? fechaEntrada : fechaSalida;

    const minimo = esEntrada
      ? inicioDelDia()
      : inicioDelDia(fechaEntrada);

    if (Platform.OS === 'android') {
      DateTimePickerAndroid.open({
        value: valorActual,
        mode: 'date',
        display: 'calendar',
        minimumDate: minimo,
        onChange: (evento, fechaElegida) => {
          if (evento.type !== 'set' || !fechaElegida) {
            return;
          }

          seleccionarFecha(tipo, fechaElegida);
        },
      });
    } else {
      if (esEntrada) {
        setMostrarEntradaIOS(true);
        setMostrarSalidaIOS(false);
      } else {
        setMostrarSalidaIOS(true);
        setMostrarEntradaIOS(false);
      }
    }
  }

  function seleccionarFecha(tipo, fechaElegida) {
    const fechaActual = tipo === 'entrada' ? fechaEntrada : fechaSalida;
    const seleccion = inicioDelDia(fechaElegida);
    seleccion.setHours(
      fechaActual.getHours(),
      fechaActual.getMinutes(),
      0,
      0
    );

    if (tipo === 'entrada') {
      setFechaEntrada(seleccion);

      if (fechaSalida <= seleccion) {
        const salidaAjustada = new Date(seleccion);
        salidaAjustada.setDate(salidaAjustada.getDate() + 1);
        setFechaSalida(salidaAjustada);
      }
    } else {
      setFechaSalida(seleccion);
    }
  }

  function abrirHora(tipo) {
    const esEntrada = tipo === 'entrada';
    const valorActual = esEntrada ? fechaEntrada : fechaSalida;

    if (Platform.OS === 'android') {
      DateTimePickerAndroid.open({
        value: valorActual,
        mode: 'time',
        is24Hour: true,
        onChange: (evento, horaElegida) => {
          if (evento.type === 'set' && horaElegida) {
            seleccionarHora(tipo, horaElegida);
          }
        },
      });
    } else if (esEntrada) {
      setMostrarHoraEntradaIOS(true);
      setMostrarHoraSalidaIOS(false);
    } else {
      setMostrarHoraSalidaIOS(true);
      setMostrarHoraEntradaIOS(false);
    }
  }

  function seleccionarHora(tipo, horaElegida) {
    const fechaActual = tipo === 'entrada' ? fechaEntrada : fechaSalida;
    const seleccion = new Date(fechaActual);
    seleccion.setHours(
      horaElegida.getHours(),
      horaElegida.getMinutes(),
      0,
      0
    );

    if (tipo === 'entrada') {
      setFechaEntrada(seleccion);
    } else {
      setFechaSalida(seleccion);
    }
  }

  function enviarReserva() {
    if (
      !nombreHuesped.trim() ||
      !apellidoHuesped.trim() ||
      !numeroDocumento.trim() ||
      !cantidadHuespedes.trim()
    ) {
      Alert.alert(
        'Datos incompletos',
        'Completa el primer nombre, primer apellido, documento y cantidad de huéspedes.'
      );
      return;
    }

    if (
      tipoDocumento === 'cedula' &&
      !/^\d{3}-\d{6}-\d{4}[A-Z]$/.test(numeroDocumento)
    ) {
      Alert.alert(
        'Cédula incorrecta',
        'Usa el formato 001-010190-0001A.'
      );
      return;
    }

    if (
      tipoDocumento === 'pasaporte' &&
      numeroDocumento.trim().length < 5
    ) {
      Alert.alert(
        'Pasaporte incorrecto',
        'Ingresa un número de pasaporte válido.'
      );
      return;
    }

    const entrada = new Date(fechaEntrada);
    const salida = new Date(fechaSalida);
    const ahora = new Date();
    ahora.setSeconds(0, 0);

    if (entrada < ahora || salida <= entrada) {
      Alert.alert(
        'Fechas u horas inválidas',
        'La entrada no puede ser anterior a la hora actual y la salida debe ser posterior a la entrada.'
      );
      return;
    }

    const cantidad = Number(cantidadHuespedes);

    if (
      !Number.isInteger(cantidad) ||
      cantidad < 1 ||
      cantidad > habitacionSeleccionada.capacidad
    ) {
      Alert.alert(
        'Cantidad de huéspedes inválida',
        `Esta habitación admite de 1 a ${habitacionSeleccionada.capacidad} personas.`
      );
      return;
    }

    const noches = Math.max(1, Math.ceil(
      (salida.getTime() - entrada.getTime()) / 86400000
    ));

    const total = noches * habitacionSeleccionada.precio;

    const nombreCompleto = [
      nombreHuesped,
      segundoNombreHuesped,
      apellidoHuesped,
      segundoApellidoHuesped,
    ]
      .map((parte) => parte.trim())
      .filter(Boolean)
      .join(' ');

    Alert.alert(
      'Solicitud de reserva',
      `Huésped: ${nombreCompleto}\n` +
        `Documento: ${
          tipoDocumento === 'cedula' ? 'Cédula' : 'Pasaporte'
        } ${numeroDocumento}\n` +
        `Habitación: ${habitacionSeleccionada.numero}\n` +
        `Tipo: ${habitacionSeleccionada.nombre}\n` +
        `Entrada: ${fechaTexto(entrada)} a las ${horaTexto(entrada)}\n` +
        `Salida: ${fechaTexto(salida)} a las ${horaTexto(salida)}\n` +
        `Huéspedes: ${cantidad}\n` +
        `Noches: ${noches}\n` +
        `Total estimado: $${total.toFixed(2)}\n\n` +
        'Esta solicitud todavía no se ha guardado en Firebase ni confirma disponibilidad.',
      [
        {
          text: 'Aceptar',
          onPress: () => setHabitacionSeleccionada(null),
        },
      ]
    );
  }

  function campoFecha(etiqueta, valor, minimo, tipo) {
    if (Platform.OS === 'web') {
      return (
        <>
          <Text style={styles.etiqueta}>{etiqueta}</Text>
          {React.createElement('input', {
            type: 'date',
            value: fechaISO(valor),
            min: fechaISO(minimo),
            onChange: (evento) => {
              if (evento.target.value) {
                seleccionarFecha(
                  tipo,
                  new Date(`${evento.target.value}T00:00:00`)
                );
              }
            },
            'aria-label': etiqueta,
            style: {
              boxSizing: 'border-box',
              width: '100%',
              backgroundColor: '#F7F9FA',
              border: '1px solid #DDE5E9',
              borderRadius: 10,
              padding: '15px 12px',
              color: '#22313C',
              fontSize: 15,
              fontFamily: 'inherit',
              cursor: 'pointer',
            },
          })}
        </>
      );
    }

    return (
      <>
        <Text style={styles.etiqueta}>{etiqueta}</Text>

        <Pressable
          style={styles.selectorFecha}
          onPress={() => abrirCalendario(tipo)}
          accessibilityRole="button"
        >
          <Text style={styles.textoFecha}>
            {fechaTexto(valor)}
          </Text>

          <Text style={styles.iconoCalendario}>▦</Text>
        </Pressable>
      </>
    );
  }

  function campoHora(etiqueta, valor, tipo) {
    if (Platform.OS === 'web') {
      return (
        <>
          <Text style={styles.etiqueta}>{etiqueta}</Text>
          {React.createElement('input', {
            type: 'time',
            value: horaISO(valor),
            onChange: (evento) => {
              if (evento.target.value) {
                const [hora, minuto] = evento.target.value
                  .split(':')
                  .map(Number);
                const seleccion = new Date(valor);
                seleccion.setHours(hora, minuto, 0, 0);
                seleccionarHora(tipo, seleccion);
              }
            },
            'aria-label': etiqueta,
            style: {
              boxSizing: 'border-box',
              width: '100%',
              backgroundColor: '#F7F9FA',
              border: '1px solid #DDE5E9',
              borderRadius: 10,
              padding: '15px 12px',
              color: '#22313C',
              fontSize: 15,
              fontFamily: 'inherit',
              cursor: 'pointer',
            },
          })}
        </>
      );
    }

    return (
      <>
        <Text style={styles.etiqueta}>{etiqueta}</Text>
        <Pressable
          style={styles.selectorFecha}
          onPress={() => abrirHora(tipo)}
          accessibilityRole="button"
        >
          <Text style={styles.textoFecha}>{horaTexto(valor)}</Text>
          <Text style={styles.iconoCalendario}>◷</Text>
        </Pressable>
      </>
    );
  }

  return (
    <View style={styles.pantalla}>
      <ScrollView
        contentContainerStyle={styles.contenido}
        showsVerticalScrollIndicator={false}
      >
        <Text style={styles.subtitulo}>
          HOTEL POSADA EL RECUERDO
        </Text>

        <Text style={styles.titulo}>
          Catálogo de habitaciones
        </Text>

        <Text style={styles.descripcion}>
          Encuentra tu habitación ideal y solicita tu reserva.
        </Text>

        <TextInput
          style={styles.busqueda}
          placeholder="Buscar habitación por número o tipo..."
          value={busqueda}
          onChangeText={setBusqueda}
        />

        <Text style={styles.contador}>
          {habitacionesFiltradas.length} de 15 habitaciones
        </Text>

        {habitacionesFiltradas.map((habitacion) => (
          <View key={habitacion.numero} style={styles.tarjeta}>
            <Image
              source={{ uri: habitacion.imagen }}
              style={styles.imagen}
              resizeMode="cover"
            />

            <View style={styles.informacion}>
              <Text style={styles.numero}>
                HABITACIÓN {habitacion.numero}
              </Text>

              <Text style={styles.nombre}>
                {habitacion.nombre}
              </Text>

              <Text style={styles.detalle}>
                Capacidad: {habitacion.capacidad} personas
              </Text>

              <Text style={styles.detalle}>
                Camas: {habitacion.camas}
              </Text>

              <Text style={styles.servicios}>
                {habitacion.servicios}
              </Text>

              <Text style={styles.precio}>
                ${habitacion.precio.toFixed(2)}
                <Text style={styles.noche}> / noche</Text>
              </Text>

              <Pressable
                style={styles.botonReserva}
                onPress={() => abrirReserva(habitacion)}
              >
                <Text style={styles.textoBotonReserva}>
                  Reservar habitación
                </Text>
              </Pressable>
            </View>
          </View>
        ))}

        {habitacionesFiltradas.length === 0 && (
          <Text style={styles.sinResultados}>
            No se encontraron habitaciones.
          </Text>
        )}
      </ScrollView>

      <Modal
        visible={habitacionSeleccionada !== null}
        transparent
        animationType="slide"
        onRequestClose={() => setHabitacionSeleccionada(null)}
      >
        <View style={styles.fondoModal}>
          <ScrollView
            style={styles.modal}
            contentContainerStyle={styles.modalContenido}
            keyboardShouldPersistTaps="handled"
          >
            <Pressable
              style={styles.cerrar}
              onPress={() => setHabitacionSeleccionada(null)}
            >
              <Text style={styles.textoCerrar}>✕</Text>
            </Pressable>

            <Text style={styles.tituloModal}>
              Solicitar reserva
            </Text>

            {habitacionSeleccionada && (
              <>
                <Text style={styles.habitacionModal}>
                  Habitación {habitacionSeleccionada.numero}
                </Text>

                <Text style={styles.detalle}>
                  {habitacionSeleccionada.nombre}
                </Text>

                <Text style={styles.precio}>
                  ${habitacionSeleccionada.precio.toFixed(2)} por noche
                </Text>+

                <Text style={styles.etiqueta}>
                  Primer nombre *
                </Text>

                <TextInput
                  style={styles.campo}
                  placeholder="Escribe tu primer nombre"
                  value={nombreHuesped}
                  onChangeText={setNombreHuesped}
                  autoCapitalize="words"
                />

                <Text style={styles.etiqueta}>
                  Segundo nombre
                </Text>

                <TextInput
                  style={styles.campo}
                  placeholder="Segundo nombre (opcional)"
                  value={segundoNombreHuesped}
                  onChangeText={setSegundoNombreHuesped}
                  autoCapitalize="words"
                />

                <Text style={styles.etiqueta}>
                  Primer apellido *
                </Text>

                <TextInput
                  style={styles.campo}
                  placeholder="Escribe tu primer apellido"
                  value={apellidoHuesped}
                  onChangeText={setApellidoHuesped}
                  autoCapitalize="words"
                />

                <Text style={styles.etiqueta}>
                  Segundo apellido
                </Text>

                <TextInput
                  style={styles.campo}
                  placeholder="Segundo apellido (opcional)"
                  value={segundoApellidoHuesped}
                  onChangeText={setSegundoApellidoHuesped}
                  autoCapitalize="words"
                />

                <Text style={styles.etiqueta}>
                  Tipo de Identificación *
                </Text>

                <View style={styles.pickerContenedor}>
                  <Picker
                    selectedValue={tipoDocumento}
                    onValueChange={(valor) => {
                      setTipoDocumento(valor);
                      setNumeroDocumento('');
                    }}
                  >
                    <Picker.Item label="Cédula" value="cedula" />
                    <Picker.Item label="Pasaporte" value="pasaporte" />
                  </Picker>
                </View>

                <Text style={styles.etiqueta}>
                  {tipoDocumento === 'cedula'
                    ? 'Número de cédula *'
                    : 'Número de pasaporte *'}
                </Text>

                <TextInput
                  style={styles.campo}
                  placeholder={
                    tipoDocumento === 'cedula'
                      ? 'Ej. 001-010190-0001A'
                      : 'Número de pasaporte'
                  }
                  value={numeroDocumento}
                  onChangeText={(texto) => {
                    if (tipoDocumento === 'cedula') {
                      const limpio = texto
                        .toUpperCase()
                        .replace(/[^0-9A-Z]/g, '')
                        .slice(0, 14);

                      let formateado = limpio;

                      if (limpio.length > 9) {
                        formateado =
                          `${limpio.slice(0, 3)}-` +
                          `${limpio.slice(3, 9)}-` +
                          `${limpio.slice(9, 13)}` +
                          `${limpio.slice(13, 14)}`;
                      } else if (limpio.length > 3) {
                        formateado =
                          `${limpio.slice(0, 3)}-` +
                          limpio.slice(3);
                      }

                      setNumeroDocumento(formateado);
                    } else {
                      setNumeroDocumento(
                        texto
                          .toUpperCase()
                          .replace(/[^0-9A-Z]/g, '')
                          .slice(0, 20)
                      );
                    }
                  }}
                  autoCapitalize="characters"
                  maxLength={tipoDocumento === 'cedula' ? 16 : 20}
                />

                {campoFecha(
                  'Fecha de entrada *',
                  fechaEntrada,
                  inicioDelDia(),
                  'entrada'
                )}

                {Platform.OS === 'ios' && mostrarEntradaIOS && (
                  <View style={styles.selectorIOS}>
                    <DateTimePicker
                      value={fechaEntrada}
                      mode="date"
                      display="inline"
                      minimumDate={inicioDelDia()}
                      onChange={(_, fechaElegida) => {
                        if (fechaElegida) {
                          seleccionarFecha('entrada', fechaElegida);
                        }
                      }}
                    />

                    <Pressable
                      onPress={() => setMostrarEntradaIOS(false)}
                      style={styles.botonReserva}
                    >
                      <Text style={styles.textoBotonReserva}>
                        Listo
                      </Text>
                    </Pressable>
                  </View>
                )}

                {campoHora('Hora de entrada *', fechaEntrada, 'entrada')}

                {Platform.OS === 'ios' && mostrarHoraEntradaIOS && (
                  <View style={styles.selectorIOS}>
                    <DateTimePicker
                      value={fechaEntrada}
                      mode="time"
                      display="spinner"
                      is24Hour
                      onChange={(_, horaElegida) => {
                        if (horaElegida) {
                          seleccionarHora('entrada', horaElegida);
                        }
                      }}
                    />

                    <Pressable
                      onPress={() => setMostrarHoraEntradaIOS(false)}
                      style={styles.botonReserva}
                    >
                      <Text style={styles.textoBotonReserva}>
                        Listo
                      </Text>
                    </Pressable>
                  </View>
                )}

                {campoFecha(
                  'Fecha de salida *',
                  fechaSalida,
                  inicioDelDia(fechaEntrada),
                  'salida'
                )}

                {Platform.OS === 'ios' && mostrarSalidaIOS && (
                  <View style={styles.selectorIOS}>
                    <DateTimePicker
                      value={fechaSalida}
                      mode="date"
                      display="inline"
                      minimumDate={inicioDelDia(fechaEntrada)}
                      onChange={(_, fechaElegida) => {
                        if (fechaElegida) {
                          seleccionarFecha('salida', fechaElegida);
                        }
                      }}
                    />

                    <Pressable
                      onPress={() => setMostrarSalidaIOS(false)}
                      style={styles.botonReserva}
                    >
                      <Text style={styles.textoBotonReserva}>
                        Listo
                      </Text>
                    </Pressable>
                  </View>
                )}

                {campoHora('Hora de salida *', fechaSalida, 'salida')}

                {Platform.OS === 'ios' && mostrarHoraSalidaIOS && (
                  <View style={styles.selectorIOS}>
                    <DateTimePicker
                      value={fechaSalida}
                      mode="time"
                      display="spinner"
                      is24Hour
                      onChange={(_, horaElegida) => {
                        if (horaElegida) {
                          seleccionarHora('salida', horaElegida);
                        }
                      }}
                    />

                    <Pressable
                      onPress={() => setMostrarHoraSalidaIOS(false)}
                      style={styles.botonReserva}
                    >
                      <Text style={styles.textoBotonReserva}>
                        Listo
                      </Text>
                    </Pressable>
                  </View>
                )}

                <Text style={styles.etiqueta}>
                  Cantidad de huéspedes *
                </Text>

                <TextInput
                  style={styles.campo}
                  value={cantidadHuespedes}
                  onChangeText={setCantidadHuespedes}
                  keyboardType="number-pad"
                />

                <Pressable
                  style={styles.botonReserva}
                  onPress={enviarReserva}
                >
                  <Text style={styles.textoBotonReserva}>
                    Continuar con la reserva
                  </Text>
                </Pressable>

                <Pressable
                  style={styles.botonCancelar}
                  onPress={() => setHabitacionSeleccionada(null)}
                >
                  <Text style={styles.textoCancelar}>
                    Cancelar
                  </Text>
                </Pressable>
              </>
            )}
          </ScrollView>
        </View>
      </Modal>
    </View>
  );
}

const styles = StyleSheet.create({
  pantalla: {
    flex: 1,
    backgroundColor: '#F4F6FA',
  },
  contenido: {
    padding: 18,
    paddingBottom: 35,
  },
  subtitulo: {
    color: '#239B83',
    fontSize: 12,
    fontWeight: '800',
    letterSpacing: 1,
  },
  titulo: {
    color: '#173B3A',
    fontSize: 25,
    fontWeight: '800',
    marginTop: 8,
  },
  descripcion: {
    color: '#65737D',
    fontSize: 14,
    marginTop: 8,
    marginBottom: 18,
  },
  busqueda: {
    backgroundColor: '#FFFFFF',
    borderColor: '#E1E7EB',
    borderWidth: 1,
    borderRadius: 12,
    padding: 13,
    marginBottom: 12,
    color: '#22313C',
  },
  contador: {
    color: '#65737D',
    fontSize: 12,
    marginBottom: 14,
  },
  tarjeta: {
    backgroundColor: '#FFFFFF',
    borderRadius: 16,
    overflow: 'hidden',
    marginBottom: 18,
    elevation: 3,
  },
  imagen: {
    width: '100%',
    height: 190,
    backgroundColor: '#E3E9EA',
  },
  informacion: {
    padding: 16,
  },
  numero: {
    color: '#239B83',
    fontSize: 12,
    fontWeight: '800',
  },
  nombre: {
    color: '#173B3A',
    fontSize: 19,
    fontWeight: '800',
    marginTop: 5,
    marginBottom: 8,
  },
  detalle: {
    color: '#65737D',
    fontSize: 13,
    marginBottom: 5,
  },
  servicios: {
    color: '#65737D',
    fontSize: 12,
    marginTop: 6,
  },
  precio: {
    color: '#173B3A',
    fontSize: 22,
    fontWeight: '800',
    marginTop: 12,
    marginBottom: 12,
  },
  noche: {
    color: '#82909C',
    fontSize: 12,
    fontWeight: '400',
  },
  botonReserva: {
    backgroundColor: '#239B83',
    borderRadius: 11,
    padding: 14,
    alignItems: 'center',
    marginTop: 8,
  },
  textoBotonReserva: {
    color: '#FFFFFF',
    fontSize: 14,
    fontWeight: '800',
  },
  sinResultados: {
    color: '#65737D',
    textAlign: 'center',
    marginTop: 25,
  },
  fondoModal: {
    flex: 1,
    justifyContent: 'flex-end',
    backgroundColor: 'rgba(0,0,0,0.5)',
  },
  modal: {
    maxHeight: '90%',
    backgroundColor: '#FFFFFF',
    borderTopLeftRadius: 24,
    borderTopRightRadius: 24,
  },
  modalContenido: {
    padding: 22,
    paddingBottom: 35,
  },
  cerrar: {
    alignSelf: 'flex-end',
    padding: 5,
  },
  textoCerrar: {
    fontSize: 23,
    color: '#65737D',
  },
  tituloModal: {
    fontSize: 24,
    fontWeight: '800',
    color: '#173B3A',
    marginBottom: 12,
  },
  habitacionModal: {
    color: '#239B83',
    fontSize: 17,
    fontWeight: '800',
    marginBottom: 5,
  },
  etiqueta: {
    color: '#34434E',
    fontSize: 13,
    fontWeight: '700',
    marginTop: 14,
    marginBottom: 7,
  },
  campo: {
    backgroundColor: '#F7F9FA',
    borderWidth: 1,
    borderColor: '#DDE5E9',
    borderRadius: 10,
    padding: 12,
    color: '#22313C',
  },
  pickerContenedor: {
    backgroundColor: '#F7F9FA',
    borderWidth: 1,
    borderColor: '#DDE5E9',
    borderRadius: 10,
    overflow: 'hidden',
  },
  selectorFecha: {
    backgroundColor: '#F7F9FA',
    borderWidth: 1,
    borderColor: '#DDE5E9',
    borderRadius: 10,
    paddingHorizontal: 12,
    paddingVertical: 15,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
  },
  textoFecha: {
    color: '#22313C',
    fontSize: 15,
  },
  iconoCalendario: {
    color: '#239B83',
    fontSize: 20,
    fontWeight: '700',
  },
  selectorIOS: {
    backgroundColor: '#F7F9FA',
    borderRadius: 10,
    marginTop: 8,
    padding: 8,
  },
  botonCancelar: {
    padding: 14,
    alignItems: 'center',
    marginTop: 8,
  },
  textoCancelar: {
    color: '#65737D',
    fontWeight: '700',
  },
});
