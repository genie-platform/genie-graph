import { BigInt } from "@graphprotocol/graph-ts"
import { FundingCreated } from "../generated/FundingFactory/FundingFactory"
import { Deposited, Withdrawn } from "../generated/templates/Funding/Funding"
import { Funding as FundingDataSource } from "../generated/templates"

import { Funding, Deposit, Withdraw } from "../generated/schema"

export function handleFundingCreated(event: FundingCreated): void {
  let entity = new Funding(event.params.funding.toHexString())

  // Entity fields can be set based on event parameters
  entity.address = event.params.funding
  entity.owner = event.params.owner
  entity.operator = event.params.operator
  entity.interestToken = event.params.interestToken

  entity.createdAt = event.block.timestamp.toI32()
  entity.txHash = event.transaction.hash

  FundingDataSource.create(event.params.funding)

  // Entities can be written to the store with `.save()`
  entity.save()
}

export function handleDeposited(event: Deposited): void {
  let id = event.transaction.hash.toHexString() + '_' + event.logIndex.toString() as string

  let entity = new Deposit(id)
  entity.sender = event.params.sender
  entity.amount = event.params.amount

  entity.funding = event.address
  entity.createdAt = event.block.timestamp.toI32()
  entity.txHash = event.transaction.hash

  entity.save()
}

export function handleWithdrawn(event: Withdrawn): void {
  let id = event.transaction.hash.toHexString() + '_' + event.logIndex.toString() as string

  let entity = new Withdraw(id)
  entity.sender = event.params.sender
  entity.amount = event.params.amount

  entity.funding = event.address
  entity.createdAt = event.block.timestamp.toI32()
  entity.txHash = event.transaction.hash

  entity.save()
}
