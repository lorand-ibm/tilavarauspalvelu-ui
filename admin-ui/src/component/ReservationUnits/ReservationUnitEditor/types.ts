import Joi from "joi";
import {
  Maybe,
  Query,
  ReservationUnitByPkType,
  ReservationUnitCreateMutationInput,
  ReservationUnitsReservationUnitImageImageTypeChoices,
  ReservationUnitUpdateMutationInput,
  ResourceType,
  SpaceType,
  UnitByPkType,
} from "../../../common/gql-types";
import { OptionType } from "../../../common/types";

export interface IProps {
  reservationUnitPk?: string;
  unitPk: string;
}

export type NotificationType = {
  title: string;
  text: string;
  type: "success" | "error";
};

export type Action =
  | {
      type: "setNotification";
      notification: NotificationType;
    }
  | { type: "clearNotification" }
  | { type: "clearError" }
  | { type: "dataLoaded"; reservationUnit: ReservationUnitByPkType }
  | { type: "unitLoaded"; unit: UnitByPkType }
  | { type: "editNew"; unitPk: number }
  | { type: "dataInitializationError"; message: string }
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  | { type: "set"; value: any }
  | { type: "setSpaces"; spaces: OptionType[] }
  | { type: "setResources"; resources: OptionType[] }
  | { type: "setEquipments"; equipments: OptionType[] }
  | { type: "setPurposes"; purposes: OptionType[] }
  | { type: "parametersLoaded"; parameters: Query }
  | {
      type: "setValidatioErrors";
      validationErrors: Joi.ValidationResult | null;
    }
  | { type: "setImages"; images: Image[] };

export type ReservationUnitEditorType =
  | ReservationUnitUpdateMutationInput
  | ReservationUnitCreateMutationInput;

export enum LoadingCompleted {
  "UNIT",
  "RESERVATION_UNIT",
  "PARAMS",
}

export type State = {
  reservationUnitPk?: number;
  loading: boolean;
  reservationUnit: ReservationUnitByPkType | null;
  reservationUnitEdit: Partial<ReservationUnitEditorType>;
  hasChanges: boolean;
  error?: {
    message: string;
  };
  spaces: SpaceType[];
  resources: ResourceType[];
  spaceOptions: OptionType[];
  resourceOptions: OptionType[];
  equipmentOptions: OptionType[];
  purposeOptions: OptionType[];
  reservationUnitTypeOptions: OptionType[];
  paymentTermsOptions: OptionType[];
  cancellationTermsOptions: OptionType[];
  serviceSpecificTermsOptions: OptionType[];
  cancellationRuleOptions: OptionType[];
  taxPercentageOptions: OptionType[];
  metadataOptions: OptionType[];
  unit?: UnitByPkType;
  dataLoaded: LoadingCompleted[];
  images: Image[];
  validationErrors: Joi.ValidationResult | null;
};

export type Image = {
  pk?: Maybe<number> | undefined;
  mediumUrl?: Maybe<string> | undefined;
  imageType?: ReservationUnitsReservationUnitImageImageTypeChoices;
  originalImageType?: ReservationUnitsReservationUnitImageImageTypeChoices;
  bytes?: File;
  deleted?: boolean;
};

export const schema = Joi.object({
  nameFi: Joi.string().required().max(80),
  nameSv: Joi.string().required().max(80),
  nameEn: Joi.string().required().max(80),
  spacePks: Joi.array().required().min(1).items(Joi.number()),
  resourcePks: Joi.array().items(Joi.number()),
  surfaceArea: Joi.number().min(1).required(), // checking against selected spaces is implemented in ui
  maxPersons: Joi.number().min(1).required(), // checking against selected spaces is implemented in ui
  reservationUnitTypePk: Joi.number().required(),
  descriptionFi: Joi.string().required().max(4000),
  descriptionSv: Joi.string().required().max(4000),
  descriptionEn: Joi.string().required().max(4000),
  minReservationDuration: Joi.number().required(),
  maxReservationDuration: Joi.number().required(),
  reservationStartInterval: Joi.string().required(),
  metadataSetPk: Joi.number().required(),
  termsOfUseFi: Joi.string().allow(null).max(10000),
  termsOfUseSv: Joi.string().allow(null).max(10000),
  termsOfUseEn: Joi.string().allow(null).max(10000),
  additionalInstructionsFi: Joi.string().allow("").max(10000),
  additionalInstructionsSv: Joi.string().allow("").max(10000),
  additionalInstructionsEn: Joi.string().allow("").max(10000),
}).options({
  allowUnknown: true,
  abortEarly: false,
});
