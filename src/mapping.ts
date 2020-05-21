import { Bytes, BigInt, store } from '@graphprotocol/graph-ts'

import { FundingCreated } from "../generated/FundingFactory/FundingFactory"
import { Deposited, Withdrawn, Rewarded } from "../generated/templates/Funding/Funding"
import { Funding as PoolDataSource } from "../generated/templates"
import { Pool, Deposit, Withdraw, Reward, AccountPool, Account, } from "../generated/schema"

export function updateAccountPool(
  accountAddress: Bytes,
  poolAddress: Bytes
) : AccountPool {
  let accountd = accountAddress.toHex()
  let account = Account.load(accountd)
  if (account == null) {
    let account = new Account(accountd)
    account.address = accountAddress
    account.save()
  }

  let accountTokenId = poolAddress.toHexString() + '_' + accountAddress.toHexString()

  let accountToken = AccountPool.load(accountTokenId)
  if (accountToken == null) {
    accountToken = new AccountPool(accountTokenId)
    accountToken.account = accountAddress.toHexString()
    accountToken.poolAddress = poolAddress

    accountToken.balance = BigInt.fromI32(0)
  }

  return accountToken as AccountPool
}


export function handlePoolCreated(event: FundingCreated): void {
  let entity = new Pool(event.params.funding.toHexString())

  // Entity fields can be set based on event parameters
  entity.address = event.params.funding
  entity.owner = event.params.owner
  entity.operator = event.params.operator
  entity.interestToken = event.params.interestToken
  entity.totalStaked = BigInt.fromI32(0)
  entity.numberOfPlayers = 0

  entity.createdAt = event.block.timestamp.toI32()
  entity.txHash = event.transaction.hash

  PoolDataSource.create(event.params.funding)

  entity.save()
}

export function handleDeposited(event: Deposited): void {
  let id = event.transaction.hash.toHexString() + '_' + event.logIndex.toString() as string

  let entity = new Deposit(id)
  entity.sender = event.params.sender
  entity.amount = event.params.amount

  entity.pool = event.address
  entity.createdAt = event.block.timestamp.toI32()
  entity.txHash = event.transaction.hash
  entity.userId = event.params.userId

  entity.save()

  let pool = Pool.load(entity.pool.toHexString())
  pool.totalStaked = pool.totalStaked.plus(entity.amount)
  pool.numberOfPlayers = pool.numberOfPlayers + 1
  pool.save()

  let accountPool = updateAccountPool(
    entity.sender,
    entity.pool
  )
  accountPool.balance = accountPool.balance.plus(entity.amount)
  accountPool.save()
}

export function handleWithdrawn(event: Withdrawn): void {
  let id = event.transaction.hash.toHexString() + '_' + event.logIndex.toString() as string

  let entity = new Withdraw(id)
  entity.sender = event.params.sender
  entity.amount = event.params.amount

  entity.pool = event.address
  entity.createdAt = event.block.timestamp.toI32()
  entity.txHash = event.transaction.hash

  entity.save()

  let pool = Pool.load(entity.pool.toHexString())
  pool.totalStaked = pool.totalStaked.minus(entity.amount)
  pool.numberOfPlayers = pool.numberOfPlayers - 1
  pool.save()

  let accountPool = updateAccountPool(
    entity.sender,
    entity.pool
  )
  accountPool.balance = accountPool.balance.minus(entity.amount)
  if (accountPool.balance == BigInt.fromI32(0)) {
    store.remove('AccountPool', accountPool.id)
  } else {
    accountPool.save()
  }
}

export function handleRewarded(event: Rewarded): void {
  let id = event.transaction.hash.toHexString() + '_' + event.logIndex.toString() as string

  let entity = new Reward(id)
  entity.receiver = event.params.receiver
  entity.amount = event.params.amount

  entity.pool = event.address
  entity.createdAt = event.block.timestamp.toI32()
  entity.txHash = event.transaction.hash

  entity.save()
}
