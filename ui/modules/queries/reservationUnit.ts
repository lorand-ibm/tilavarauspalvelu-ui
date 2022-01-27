import { gql } from "@apollo/client";

export const RESERVATION_UNIT = gql`
  query ReservationUnit($pk: Int!) {
    reservationUnitByPk(pk: $pk) {
      id
      pk
      uuid
      nameFi
      nameEn
      nameSv
      isDraft
      images {
        imageUrl
        mediumUrl
        smallUrl
        imageType
      }
      descriptionFi
      descriptionEn
      descriptionSv
      lowestPrice
      highestPrice
      priceUnit
      termsOfUseFi
      termsOfUseEn
      termsOfUseSv
      additionalInstructionsFi
      additionalInstructionsEn
      additionalInstructionsSv
      bufferTimeBefore
      bufferTimeAfter
      reservationStartInterval
      reservationBegins
      reservationEnds
      serviceSpecificTerms {
        nameFi
        nameEn
        nameSv
        textFi
        textEn
        textSv
      }
      reservationUnitType {
        nameFi
        nameEn
        nameSv
      }
      maxPersons
      minReservationDuration
      maxReservationDuration
      maxReservationsPerUser
      nextAvailableSlot
      unit {
        id
        pk
        nameFi
        nameEn
        nameSv
      }
      location {
        latitude
        longitude
        addressStreetFi
        addressStreetEn
        addressStreetSv
        addressZip
        addressCityFi
        addressCityEn
        addressCitySv
      }
      spaces {
        pk
        nameFi
        nameEn
        nameSv
      }
      openingHours(openingTimes: false, periods: true) {
        openingTimePeriods {
          periodId
          startDate
          endDate
          resourceState
          timeSpans {
            startTime
            endTime
            resourceState
            weekdays
          }
        }
      }
      requireReservationHandling
      metadataSet {
        id
        name
        pk
        supportedFields
        requiredFields
      }
    }
  }
`;

export const RESERVATION_UNITS = gql`
  query SearchReservationUnits(
    $textSearch: String
    $minPersons: Float
    $maxPersons: Float
    $unit: [ID]
    $reservationUnitType: [ID]
    $purposes: [ID]
    $first: Int
    $after: String
    $orderBy: String
    $isDraft: Boolean
    $isVisible: Boolean
  ) {
    reservationUnits(
      textSearch: $textSearch
      maxPersonsGte: $minPersons
      maxPersonsLte: $maxPersons
      reservationUnitType: $reservationUnitType
      purposes: $purposes
      unit: $unit
      first: $first
      after: $after
      orderBy: $orderBy
      isDraft: $isDraft
      isVisible: $isVisible
    ) {
      edges {
        node {
          id: pk
          nameFi
          nameEn
          nameSv
          lowestPrice
          highestPrice
          priceUnit
          nameFi
          reservationBegins
          reservationEnds
          reservationUnitType {
            id: pk
            nameFi
            nameEn
            nameSv
          }
          unit {
            id: pk
            nameFi
            nameEn
            nameSv
          }
          maxPersons
          location {
            addressStreetFi
            addressStreetEn
            addressStreetSv
          }
          images {
            imageType
            mediumUrl
          }
        }
      }
      pageInfo {
        endCursor
        hasNextPage
      }
    }
  }
`;

export const RELATED_RESERVATION_UNITS = gql`
  query RelatedReservationUnits($unit: [ID]!) {
    reservationUnits(unit: $unit) {
      edges {
        node {
          pk
          nameFi
          nameEn
          nameSv
          images {
            imageUrl
            smallUrl
            imageType
          }
          unit {
            pk
            nameFi
            nameEn
            nameSv
          }
          reservationUnitType {
            nameFi
            nameEn
            nameSv
          }
          maxPersons
          location {
            addressStreetFi
            addressStreetEn
            addressStreetSv
          }
        }
      }
    }
  }
`;

export const OPENING_HOURS = gql`
  query ReservationUnitOpeningHours(
    $pk: Int
    $startDate: Date
    $endDate: Date
    $from: Date
    $to: Date
    $state: [String]
  ) {
    reservationUnitByPk(pk: $pk) {
      openingHours(
        openingTimes: true
        periods: false
        startDate: $startDate
        endDate: $endDate
      ) {
        openingTimes {
          date
          startTime
          endTime
          state
          periods
        }
      }
      reservations(state: $state, from: $from, to: $to) {
        pk
        state
        priority
        begin
        end
        numPersons
        calendarUrl
        bufferTimeBefore
        bufferTimeAfter
      }
    }
  }
`;
