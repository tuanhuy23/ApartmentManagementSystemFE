export interface ApartmentBuildingImageDto {
  id: string | null;
  name: string | null;
  description: string | null;
  src: string | null;
}

export interface ApartmentBuildingDto {
  id: string | null;
  name: string | null;
  code: string | null;
  address: string | null;
  description: string | null;
  contactEmail: string | null;
  contactPhone: string | null;
  status: string | null;
  currencyUnit: string | null;
  apartmentBuildingImgUrl: string | null;
  images: ApartmentBuildingImageDto[] | null;
}

export interface CreateApartmentBuildingDto {
  name: string | null;
  code: string | null;
  address: string | null;
  description: string | null;
  contactEmail: string | null;
  contactPhone: string | null;
  currencyUnit: string | null;
  apartmentBuildingImgUrl: string | null;
  images: ApartmentBuildingImageDto[] | null;
  managementDisplayName: string | null;
  managementEmail: string | null;
  managementUserName: string | null;
  managementPhoneNumber: string | null;
  managementPassword: string | null;
}
