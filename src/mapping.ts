import { BigInt } from '@graphprotocol/graph-ts'

import { FundingCreated } from "../generated/FundingFactory/FundingFactory"
import { Deposited, Withdrawn, Rewarded } from "../generated/templates/Funding/Funding"
import { Funding as FundingDataSource } from "../generated/templates"
import { Funding, Deposit, Withdraw, Reward } from "../generated/schema"

export function handleFundingCreated(event: FundingCreated): void {
  let entity = new Funding(event.params.funding.toHexString())

  // Entity fields can be set based on event parameters
  entity.address = event.params.funding
  entity.owner = event.params.owner
  entity.operator = event.params.operator
  entity.interestToken = event.params.interestToken
  entity.totalStaked = BigInt.fromI32(0)
  entity.numberOfPlayers = 0

  entity.createdAt = event.block.timestamp.toI32()
  entity.txHash = event.transaction.hash

  FundingDataSource.create(event.params.funding)

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

  let funding = Funding.load(entity.funding.toHexString())
  funding.totalStaked = funding.totalStaked.plus(entity.amount)
  funding.numberOfPlayers = funding.numberOfPlayers + 1
  funding.save()
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

  let funding = Funding.load(entity.funding.toHexString())
  funding.totalStaked = funding.totalStaked.minus(entity.amount)
  funding.numberOfPlayers = funding.numberOfPlayers - 1
  funding.save()
}

export function handleRewarded(event: Rewarded): void {
  let id = event.transaction.hash.toHexString() + '_' + event.logIndex.toString() as string

  let entity = new Reward(id)
  entity.receiver = event.params.receiver
  entity.amount = event.params.amount

  entity.funding = event.address
  entity.createdAt = event.block.timestamp.toI32()
  entity.txHash = event.transaction.hash

  entity.save()
}
