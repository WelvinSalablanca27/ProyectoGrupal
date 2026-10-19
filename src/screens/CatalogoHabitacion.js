import { useMemo, useState } from 'react';
import {Image,Modal,Pressable,ScrollView,StyleSheet,Text,TextInput,View } from 'react-native';

const categories = ['Todas', 'Suites', 'Familiares', 'Dobles'];
const amenityFilters = ['Wi-Fi', 'A/C', 'Balcón / Vista'];

const rooms = [
  {
    id: 'suite-presidencial',
    name: 'Suite Presidencial',
    category: 'Suites',
    guests: 4,
    beds: '2 camas King',
    price: 120,
    amenities: ['Wi-Fi', 'A/C', 'Balcón / Vista'],
    description: 'Una estancia amplia con sala privada y vista al mar.',
    images: [
      'https://images.unsplash.com/photo-1611892440504-42a792e24d32?auto=format&fit=crop&w=1200&q=85',
      'https://images.unsplash.com/photo-1618221195710-dd6b41faaea6?auto=format&fit=crop&w=1200&q=85',
    ],
  },
  {
    id: 'habitacion-familiar',
    name: 'Habitación Familiar',
    category: 'Familiares',
    guests: 5,
    beds: '2 camas Queen',
    price: 95,
    amenities: ['Wi-Fi', 'A/C', 'Balcón / Vista'],
    description: 'Comodidad para compartir en familia, con espacio para todos.',
    images: [
      'https://images.unsplash.com/photo-1566665797739-1674de7a421a?auto=format&fit=crop&w=1200&q=85',
      'https://images.unsplash.com/photo-1590490360182-c33d57733427?auto=format&fit=crop&w=1200&q=85',
    ],
  },
  {
    id: 'habitacion-doble',
    name: 'Habitación Doble',
    category: 'Dobles',
    guests: 2,
    beds: '1 cama matrimonial',
    price: 60,
    amenities: ['Wi-Fi', 'A/C'],
    description: 'Un espacio acogedor para descansar después de un gran día.',
    images: [
      'https://images.unsplash.com/photo-1616594039964-ae9021a400a0?auto=format&fit=crop&w=1200&q=85',
      'https://images.unsplash.com/photo-1631049307264-da0ec9d70304?auto=format&fit=crop&w=1200&q=85',
    ],
  },
];

function RoomCard({ room, onOpenDetails }) {
  const [imageIndex, setImageIndex] = useState(0);

  function changeImage(direction) {
    setImageIndex(
      (currentIndex) =>
        (currentIndex + direction + room.images.length) % room.images.length,
    );
  }

  return (
    <View style={styles.roomCard}>
      <View style={styles.imageContainer}>
        <Image
          accessibilityLabel={`Foto de ${room.name}`}
          source={{ uri: room.images[imageIndex] }}
          style={styles.roomImage}
        />
        <View style={styles.imageCounter}>
          <Text style={styles.imageCounterText}>
            {imageIndex + 1} / {room.images.length}
          </Text>
        </View>
        <Pressable
          accessibilityRole="button"
          accessibilityLabel={`Foto anterior de ${room.name}`}
          onPress={() => changeImage(-1)}
          style={[styles.imageArrow, styles.previousImage]}
        >
          <Text style={styles.imageArrowText}>‹</Text>
        </Pressable>
        <Pressable
          accessibilityRole="button"
          accessibilityLabel={`Foto siguiente de ${room.name}`}
          onPress={() => changeImage(1)}
          style={[styles.imageArrow, styles.nextImage]}
        >
          <Text style={styles.imageArrowText}>›</Text>
        </Pressable>
      </View>

      <View style={styles.roomInfo}>
        <View style={styles.roomTitleRow}>
          <Text style={styles.roomName}>{room.name}</Text>
          <Text style={styles.categoryBadge}>{room.category}</Text>
        </View>
        <Text style={styles.roomSpecs}>
          <Text>♙  Máx. {room.guests} personas</Text>
          <Text>   ·   </Text>
          <Text>▤  {room.beds}</Text>
        </Text>
        <View style={styles.amenities}>
          {room.amenities.map((amenity) => (
            <View key={amenity} style={styles.amenity}>
              <Text style={styles.amenityText}>
                {amenity === 'Wi-Fi' ? '⌁' : amenity === 'A/C' ? '❄' : '⌂'}{' '}
                {amenity}
              </Text>
            </View>
          ))}
        </View>
        <View style={styles.cardFooter}>
          <View>
            <Text style={styles.price}>
              ${room.price.toFixed(2)}
              <Text style={styles.priceUnit}> / noche</Text>
            </Text>
          </View>
          <Pressable
            accessibilityRole="button"
            accessibilityLabel={`Ver detalle de ${room.name}`}
            onPress={() => onOpenDetails(room)}
            style={styles.detailButton}
          >
            <Text style={styles.detailButtonText}>Ver detalle</Text>
            <Text style={styles.detailButtonArrow}>›</Text>
          </Pressable>
        </View>
      </View>
    </View>
  );
}

export default function CatalogoHabitacion() {
  const [search, setSearch] = useState('');
  const [selectedCategory, setSelectedCategory] = useState('Todas');
  const [filterModalVisible, setFilterModalVisible] = useState(false);
  const [detailsRoom, setDetailsRoom] = useState(null);
  const [selectedAmenities, setSelectedAmenities] = useState([]);
  const [draftAmenities, setDraftAmenities] = useState([]);
  const [priceOrder, setPriceOrder] = useState('featured');
  const [draftPriceOrder, setDraftPriceOrder] = useState('featured');

  const visibleRooms = useMemo(() => {
    const normalizedSearch = search.trim().toLocaleLowerCase('es');
    const filteredRooms = rooms.filter((room) => {
      const matchesCategory =
        selectedCategory === 'Todas' || room.category === selectedCategory;
      const searchableText = [
        room.name,
        room.category,
        room.description,
        ...room.amenities,
      ]
        .join(' ')
        .toLocaleLowerCase('es');
      const matchesSearch = searchableText.includes(normalizedSearch);
      const matchesAmenities = selectedAmenities.every((amenity) =>
        room.amenities.includes(amenity),
      );
      return matchesCategory && matchesSearch && matchesAmenities;
    });

    if (priceOrder === 'featured') return filteredRooms;
    return filteredRooms.sort((first, second) =>
      priceOrder === 'asc'
        ? first.price - second.price
        : second.price - first.price,
    );
  }, [priceOrder, search, selectedAmenities, selectedCategory]);

  function openFilters() {
    setDraftAmenities(selectedAmenities);
    setDraftPriceOrder(priceOrder);
    setFilterModalVisible(true);
  }

  function toggleDraftAmenity(amenity) {
    setDraftAmenities((currentAmenities) =>
      currentAmenities.includes(amenity)
        ? currentAmenities.filter((item) => item !== amenity)
        : [...currentAmenities, amenity],
    );
  }

  function applyFilters() {
    setSelectedAmenities(draftAmenities);
    setPriceOrder(draftPriceOrder);
    setFilterModalVisible(false);
  }

  return (
    <View style={styles.screen}>
      <ScrollView
        contentContainerStyle={styles.content}
        keyboardShouldPersistTaps="handled"
        showsVerticalScrollIndicator={false}
      >
        <View style={styles.header}>
          <View style={styles.headerCopy}>
            <Text style={styles.eyebrow}>DESCUBRE TU PRÓXIMA ESTADÍA</Text>
            <Text style={styles.title}>Catálogo de habitaciones</Text>
          </View>
          <Pressable
            accessibilityRole="button"
            accessibilityLabel="Abrir filtros"
            onPress={openFilters}
            style={styles.filterButton}
          >
            <Text style={styles.filterIcon}>☷</Text>
            <Text style={styles.filterButtonText}>Filtros</Text>
            {selectedAmenities.length > 0 && (
              <View style={styles.filterCount}>
                <Text style={styles.filterCountText}>
                  {selectedAmenities.length}
                </Text>
              </View>
            )}
          </Pressable>
        </View>

        <View style={styles.searchBox}>
          <Text style={styles.searchIcon}>⌕</Text>
          <TextInput
            accessibilityLabel="Buscar habitaciones"
            onChangeText={setSearch}
            placeholder="Ej. “Suite”, “Vista al mar”"
            placeholderTextColor="#89949D"
            returnKeyType="search"
            style={styles.searchInput}
            value={search}
          />
          {search.length > 0 && (
            <Pressable
              accessibilityRole="button"
              accessibilityLabel="Limpiar búsqueda"
              onPress={() => setSearch('')}
              hitSlop={8}
            >
              <Text style={styles.clearSearch}>×</Text>
            </Pressable>
          )}
        </View>

        <ScrollView
          contentContainerStyle={styles.categoryList}
          horizontal
          showsHorizontalScrollIndicator={false}
        >
          {categories.map((category) => {
            const selected = selectedCategory === category;
            return (
              <Pressable
                key={category}
                accessibilityRole="button"
                accessibilityState={{ selected }}
                onPress={() => setSelectedCategory(category)}
                style={[
                  styles.categoryChip,
                  selected && styles.selectedCategoryChip,
                ]}
              >
                <Text
                  style={[
                    styles.categoryChipText,
                    selected && styles.selectedCategoryChipText,
                  ]}
                >
                  {category}
                </Text>
              </Pressable>
            );
          })}
        </ScrollView>

        <View style={styles.resultsHeading}>
          <Text style={styles.resultsTitle}>Habitaciones para ti</Text>
          <Text style={styles.resultsCount}>
            {visibleRooms.length} {visibleRooms.length === 1 ? 'opción' : 'opciones'}
          </Text>
        </View>

        {visibleRooms.length > 0 ? (
          visibleRooms.map((room) => (
            <RoomCard
              key={room.id}
              onOpenDetails={setDetailsRoom}
              room={room}
            />
          ))
        ) : (
          <View style={styles.emptyState}>
            <Text style={styles.emptyIcon}>⌕</Text>
            <Text style={styles.emptyTitle}>No encontramos habitaciones</Text>
            <Text style={styles.emptyDescription}>
              Prueba con otra búsqueda o cambia los filtros seleccionados.
            </Text>
            <Pressable
              accessibilityRole="button"
              onPress={() => {
                setSearch('');
                setSelectedCategory('Todas');
                setSelectedAmenities([]);
                setPriceOrder('featured');
              }}
              style={styles.clearFiltersButton}
            >
              <Text style={styles.clearFiltersText}>Limpiar búsqueda y filtros</Text>
            </Pressable>
          </View>
        )}
      </ScrollView>

      <Modal
        animationType="slide"
        onRequestClose={() => setFilterModalVisible(false)}
        transparent
        visible={filterModalVisible}
      >
        <View style={styles.modalBackdrop}>
          <Pressable
            accessibilityRole="button"
            accessibilityLabel="Cerrar filtros"
            onPress={() => setFilterModalVisible(false)}
            style={StyleSheet.absoluteFill}
          />
          <View style={styles.filterSheet}>
            <View style={styles.sheetHandle} />
            <View style={styles.sheetHeader}>
              <View>
                <Text style={styles.sheetTitle}>Filtrar habitaciones</Text>
                <Text style={styles.sheetSubtitle}>
                  Personaliza las opciones que quieres ver
                </Text>
              </View>
              <Pressable
                accessibilityRole="button"
                accessibilityLabel="Cerrar"
                onPress={() => setFilterModalVisible(false)}
                hitSlop={10}
              >
                <Text style={styles.closeButton}>×</Text>
              </Pressable>
            </View>

            <Text style={styles.filterSectionTitle}>Servicios</Text>
            <View style={styles.filterOptions}>
              {amenityFilters.map((amenity) => {
                const selected = draftAmenities.includes(amenity);
                return (
                  <Pressable
                    key={amenity}
                    accessibilityRole="checkbox"
                    accessibilityState={{ checked: selected }}
                    onPress={() => toggleDraftAmenity(amenity)}
                    style={[
                      styles.filterOption,
                      selected && styles.selectedFilterOption,
                    ]}
                  >
                    <Text
                      style={[
                        styles.filterOptionText,
                        selected && styles.selectedFilterOptionText,
                      ]}
                    >
                      {selected ? '✓  ' : '+  '}
                      {amenity}
                    </Text>
                  </Pressable>
                );
              })}
            </View>

            <Text style={styles.filterSectionTitle}>Ordenar por precio</Text>
            <View style={styles.sortOptions}>
              {[
                { value: 'featured', label: 'Recomendados' },
                { value: 'asc', label: 'Menor a mayor' },
                { value: 'desc', label: 'Mayor a menor' },
              ].map((option) => {
                const selected = draftPriceOrder === option.value;
                return (
                  <Pressable
                    key={option.value}
                    accessibilityRole="radio"
                    accessibilityState={{ selected }}
                    onPress={() => setDraftPriceOrder(option.value)}
                    style={styles.sortOption}
                  >
                    <View
                      style={[
                        styles.radioOuter,
                        selected && styles.selectedRadioOuter,
                      ]}
                    >
                      {selected && <View style={styles.radioInner} />}
                    </View>
                    <Text style={styles.sortOptionText}>{option.label}</Text>
                  </Pressable>
                );
              })}
            </View>

            <View style={styles.sheetActions}>
              <Pressable
                accessibilityRole="button"
                onPress={() => {
                  setDraftAmenities([]);
                  setDraftPriceOrder('featured');
                }}
                style={styles.resetButton}
              >
                <Text style={styles.resetButtonText}>Limpiar</Text>
              </Pressable>
              <Pressable
                accessibilityRole="button"
                onPress={applyFilters}
                style={styles.applyButton}
              >
                <Text style={styles.applyButtonText}>Ver habitaciones</Text>
              </Pressable>
            </View>
          </View>
        </View>
      </Modal>

      <Modal
        animationType="slide"
        onRequestClose={() => setDetailsRoom(null)}
        transparent
        visible={detailsRoom !== null}
      >
        {detailsRoom && (
          <View style={styles.modalBackdrop}>
            <Pressable
              accessibilityRole="button"
              accessibilityLabel="Cerrar detalle"
              onPress={() => setDetailsRoom(null)}
              style={StyleSheet.absoluteFill}
            />
            <View style={styles.detailSheet}>
              <Image
                accessibilityLabel={`Foto de ${detailsRoom.name}`}
                source={{ uri: detailsRoom.images[0] }}
                style={styles.detailImage}
              />
              <Pressable
                accessibilityRole="button"
                accessibilityLabel="Cerrar detalle"
                onPress={() => setDetailsRoom(null)}
                style={styles.detailCloseButton}
              >
                <Text style={styles.closeButton}>×</Text>
              </Pressable>
              <View style={styles.detailContent}>
                <Text style={styles.categoryBadge}>{detailsRoom.category}</Text>
                <Text style={styles.detailTitle}>{detailsRoom.name}</Text>
                <Text style={styles.detailDescription}>
                  {detailsRoom.description}
                </Text>
                <Text style={styles.detailSpecs}>
                  ♙  Hasta {detailsRoom.guests} personas
                </Text>
                <Text style={styles.detailSpecs}>▤  {detailsRoom.beds}</Text>
                <View style={styles.amenities}>
                  {detailsRoom.amenities.map((amenity) => (
                    <View key={amenity} style={styles.amenity}>
                      <Text style={styles.amenityText}>{amenity}</Text>
                    </View>
                  ))}
                </View>
                <Text style={styles.detailPrice}>
                  ${detailsRoom.price.toFixed(2)}
                  <Text style={styles.priceUnit}> / noche</Text>
                </Text>
              </View>
            </View>
          </View>
        )}
      </Modal>
    </View>
  );
}

const styles = StyleSheet.create({
  screen: {
    flex: 1,
    backgroundColor: '#F4F6FA',
  },
  content: {
    paddingHorizontal: 20,
    paddingTop: 22,
    paddingBottom: 32,
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 18,
  },
  headerCopy: {
    flex: 1,
    paddingRight: 8,
  },
  eyebrow: {
    color: '#82909C',
    fontSize: 9,
    fontWeight: '800',
    letterSpacing: 1,
    marginBottom: 5,
  },
  title: {
    color: '#22313C',
    fontSize: 22,
    fontWeight: '800',
  },
  filterButton: {
    minHeight: 42,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: '#FFFFFF',
    borderWidth: 1,
    borderColor: '#E4E9ED',
    borderRadius: 13,
    paddingHorizontal: 12,
  },
  filterIcon: {
    color: '#315C57',
    fontSize: 18,
    fontWeight: '700',
    marginRight: 6,
  },
  filterButtonText: {
    color: '#315C57',
    fontSize: 12,
    fontWeight: '700',
  },
  filterCount: {
    minWidth: 18,
    height: 18,
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: '#239B83',
    borderRadius: 10,
    marginLeft: 6,
  },
  filterCountText: {
    color: '#FFFFFF',
    fontSize: 10,
    fontWeight: '800',
  },
  searchBox: {
    height: 50,
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#FFFFFF',
    borderWidth: 1,
    borderColor: '#E7EBEF',
    borderRadius: 15,
    paddingHorizontal: 14,
    marginBottom: 16,
  },
  searchIcon: {
    color: '#82909C',
    fontSize: 26,
    lineHeight: 30,
    marginRight: 9,
  },
  searchInput: {
    flex: 1,
    color: '#22313C',
    fontSize: 13,
    paddingVertical: 0,
  },
  clearSearch: {
    color: '#82909C',
    fontSize: 24,
    paddingHorizontal: 2,
  },
  categoryList: {
    paddingBottom: 4,
  },
  categoryChip: {
    minHeight: 37,
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: '#FFFFFF',
    borderColor: '#E7EBEF',
    borderWidth: 1,
    borderRadius: 22,
    paddingHorizontal: 16,
    marginRight: 9,
  },
  selectedCategoryChip: {
    backgroundColor: '#173B3A',
    borderColor: '#173B3A',
  },
  categoryChipText: {
    color: '#5E6C76',
    fontSize: 12,
    fontWeight: '700',
  },
  selectedCategoryChipText: {
    color: '#FFFFFF',
  },
  resultsHeading: {
    flexDirection: 'row',
    alignItems: 'baseline',
    justifyContent: 'space-between',
    marginTop: 21,
    marginBottom: 12,
  },
  resultsTitle: {
    color: '#22313C',
    fontSize: 16,
    fontWeight: '800',
  },
  resultsCount: {
    color: '#82909C',
    fontSize: 11,
    fontWeight: '600',
  },
  roomCard: {
    overflow: 'hidden',
    backgroundColor: '#FFFFFF',
    borderRadius: 18,
    marginBottom: 16,
    shadowColor: '#22313C',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.07,
    shadowRadius: 12,
    elevation: 3,
  },
  imageContainer: {
    height: 190,
    backgroundColor: '#E3E9EA',
    position: 'relative',
  },
  roomImage: {
    width: '100%',
    height: '100%',
  },
  imageCounter: {
    position: 'absolute',
    right: 12,
    bottom: 12,
    backgroundColor: 'rgba(20, 32, 38, 0.68)',
    borderRadius: 12,
    paddingHorizontal: 9,
    paddingVertical: 5,
  },
  imageCounterText: {
    color: '#FFFFFF',
    fontSize: 10,
    fontWeight: '700',
  },
  imageArrow: {
    position: 'absolute',
    top: '42%',
    width: 32,
    height: 32,
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: 'rgba(20, 32, 38, 0.58)',
    borderRadius: 18,
  },
  previousImage: {
    left: 10,
  },
  nextImage: {
    right: 10,
  },
  imageArrowText: {
    color: '#FFFFFF',
    fontSize: 25,
    lineHeight: 29,
  },
  roomInfo: {
    paddingHorizontal: 16,
    paddingTop: 14,
    paddingBottom: 15,
  },
  roomTitleRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginBottom: 8,
  },
  roomName: {
    flex: 1,
    color: '#22313C',
    fontSize: 17,
    fontWeight: '800',
    marginRight: 8,
  },
  categoryBadge: {
    overflow: 'hidden',
    color: '#267B68',
    backgroundColor: '#E9F5F0',
    borderRadius: 8,
    paddingHorizontal: 8,
    paddingVertical: 5,
    fontSize: 10,
    fontWeight: '800',
  },
  roomSpecs: {
    color: '#65737D',
    fontSize: 12,
    lineHeight: 19,
  },
  amenities: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    marginTop: 9,
  },
  amenity: {
    backgroundColor: '#F4F7F7',
    borderRadius: 8,
    paddingHorizontal: 8,
    paddingVertical: 6,
    marginRight: 6,
    marginBottom: 5,
  },
  amenityText: {
    color: '#51626D',
    fontSize: 10,
    fontWeight: '600',
  },
  cardFooter: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    borderTopWidth: 1,
    borderTopColor: '#EEF1F2',
    paddingTop: 12,
    marginTop: 8,
  },
  price: {
    color: '#173B3A',
    fontSize: 19,
    fontWeight: '800',
  },
  priceUnit: {
    color: '#82909C',
    fontSize: 11,
    fontWeight: '500',
  },
  detailButton: {
    minHeight: 39,
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#173B3A',
    borderRadius: 11,
    paddingHorizontal: 12,
  },
  detailButtonText: {
    color: '#FFFFFF',
    fontSize: 11,
    fontWeight: '700',
  },
  detailButtonArrow: {
    color: '#FFFFFF',
    fontSize: 20,
    lineHeight: 22,
    marginLeft: 5,
  },
  emptyState: {
    alignItems: 'center',
    backgroundColor: '#FFFFFF',
    borderRadius: 18,
    paddingHorizontal: 24,
    paddingVertical: 34,
    marginTop: 4,
  },
  emptyIcon: {
    color: '#A6B2B9',
    fontSize: 36,
  },
  emptyTitle: {
    color: '#22313C',
    fontSize: 16,
    fontWeight: '800',
    textAlign: 'center',
    marginTop: 10,
  },
  emptyDescription: {
    color: '#82909C',
    fontSize: 12,
    lineHeight: 18,
    textAlign: 'center',
    marginTop: 6,
  },
  clearFiltersButton: {
    paddingHorizontal: 14,
    paddingVertical: 10,
    marginTop: 14,
  },
  clearFiltersText: {
    color: '#267B68',
    fontSize: 12,
    fontWeight: '800',
  },
  modalBackdrop: {
    flex: 1,
    justifyContent: 'flex-end',
    backgroundColor: 'rgba(15, 25, 30, 0.48)',
  },
  filterSheet: {
    backgroundColor: '#FFFFFF',
    borderTopLeftRadius: 24,
    borderTopRightRadius: 24,
    paddingHorizontal: 22,
    paddingTop: 10,
    paddingBottom: 28,
  },
  sheetHandle: {
    width: 38,
    height: 4,
    alignSelf: 'center',
    backgroundColor: '#DDE3E6',
    borderRadius: 3,
    marginBottom: 18,
  },
  sheetHeader: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    justifyContent: 'space-between',
    marginBottom: 18,
  },
  sheetTitle: {
    color: '#22313C',
    fontSize: 19,
    fontWeight: '800',
  },
  sheetSubtitle: {
    color: '#82909C',
    fontSize: 12,
    marginTop: 4,
  },
  closeButton: {
    color: '#5F6D76',
    fontSize: 27,
    lineHeight: 29,
  },
  filterSectionTitle: {
    color: '#34434E',
    fontSize: 13,
    fontWeight: '800',
    marginBottom: 10,
  },
  filterOptions: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    marginBottom: 20,
  },
  filterOption: {
    minHeight: 36,
    justifyContent: 'center',
    backgroundColor: '#F5F7F8',
    borderWidth: 1,
    borderColor: '#E8ECEE',
    borderRadius: 18,
    paddingHorizontal: 12,
    marginRight: 7,
    marginBottom: 7,
  },
  selectedFilterOption: {
    backgroundColor: '#E9F5F0',
    borderColor: '#B6DCCF',
  },
  filterOptionText: {
    color: '#5E6C76',
    fontSize: 11,
    fontWeight: '700',
  },
  selectedFilterOptionText: {
    color: '#267B68',
  },
  sortOptions: {
    marginBottom: 21,
  },
  sortOption: {
    minHeight: 38,
    flexDirection: 'row',
    alignItems: 'center',
  },
  radioOuter: {
    width: 18,
    height: 18,
    alignItems: 'center',
    justifyContent: 'center',
    borderWidth: 1.5,
    borderColor: '#AFBAC0',
    borderRadius: 9,
    marginRight: 9,
  },
  selectedRadioOuter: {
    borderColor: '#239B83',
  },
  radioInner: {
    width: 9,
    height: 9,
    backgroundColor: '#239B83',
    borderRadius: 5,
  },
  sortOptionText: {
    color: '#43515C',
    fontSize: 12,
  },
  sheetActions: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  resetButton: {
    minHeight: 48,
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    borderWidth: 1,
    borderColor: '#DFE5E8',
    borderRadius: 13,
    marginRight: 10,
  },
  resetButtonText: {
    color: '#52616B',
    fontSize: 13,
    fontWeight: '700',
  },
  applyButton: {
    minHeight: 48,
    flex: 2,
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: '#173B3A',
    borderRadius: 13,
  },
  applyButtonText: {
    color: '#FFFFFF',
    fontSize: 13,
    fontWeight: '800',
  },
  detailSheet: {
    overflow: 'hidden',
    backgroundColor: '#FFFFFF',
    borderTopLeftRadius: 24,
    borderTopRightRadius: 24,
  },
  detailImage: {
    width: '100%',
    height: 220,
    backgroundColor: '#E3E9EA',
  },
  detailCloseButton: {
    position: 'absolute',
    top: 14,
    right: 16,
    width: 36,
    height: 36,
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: 'rgba(255, 255, 255, 0.92)',
    borderRadius: 18,
  },
  detailContent: {
    paddingHorizontal: 22,
    paddingTop: 18,
    paddingBottom: 28,
  },
  detailTitle: {
    color: '#22313C',
    fontSize: 22,
    fontWeight: '800',
    marginTop: 10,
  },
  detailDescription: {
    color: '#6B7881',
    fontSize: 13,
    lineHeight: 19,
    marginTop: 7,
    marginBottom: 12,
  },
  detailSpecs: {
    color: '#51626D',
    fontSize: 13,
    lineHeight: 24,
  },
  detailPrice: {
    color: '#173B3A',
    fontSize: 23,
    fontWeight: '800',
    marginTop: 10,
  },
});