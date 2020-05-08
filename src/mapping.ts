import { BigInt } from "@graphprotocol/graph-ts"
import { FundingCreated } from "../generated/FundingFactory/FundingFactory"
import { Deposited } from "../generated/templates/Funding/Funding"

import { Funding } from "../generated/schema"

export function handleFundingCreated(event: FundingCreated): void {
  let entity = new Funding(event.params.funding.toHexString())

  // Entity fields can be set based on event parameters
  entity.address = event.params.funding
  entity.owner = event.params.owner
  entity.operator = event.params.operator
  entity.interestToken = event.params.interestToken
  entity.totalStaked = BigInt.fromI32(0)

  entity.createdAt = event.block.timestamp.toI32()
  entity.txHash = event.transaction.hash

  // Entities can be written to the store with `.save()`
  entity.save()
}

// export function handleDeposited(event: Deposited): void {

// }
