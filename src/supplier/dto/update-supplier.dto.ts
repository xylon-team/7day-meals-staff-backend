import { PartialType } from '@nestjs/mapped-types';
import { CreateSupplierDto } from './create-supplier.dto';
import { Type } from 'class-transformer';
import {
  ArrayUnique,
  IsArray,
  IsBoolean,
  IsInt,
  Min,
  ValidateIf,
  ValidateNested,
} from 'class-validator';

// ============= Supplied Item Updates =============
export class SupplierInventoryItemDto {
  @IsInt()
  @Min(1)
  inventory_id: number;

  @ValidateIf((_object, value) => value !== undefined)
  @IsBoolean()
  is_available?: boolean;
}

// ============= Supplier Contact Updates =============
export class UpdateSupplierDto extends PartialType(CreateSupplierDto, {
  skipNullProperties: false,
}) {
  // Omission preserves links; an empty list clears all supplied items.
  @ValidateIf((_object, value) => value !== undefined)
  @IsArray()
  @ArrayUnique((item: SupplierInventoryItemDto) => item?.inventory_id)
  @ValidateNested({ each: true })
  @Type(() => SupplierInventoryItemDto)
  inventory_items?: SupplierInventoryItemDto[];
}
