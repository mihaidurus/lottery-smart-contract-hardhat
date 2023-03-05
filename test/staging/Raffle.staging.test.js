const { developmentChains, networkConfig } = require("../../helper-hardhat-config")
const { assert, expect } = require("chai")
const { deployments, ethers, getNamedAccounts } = require("hardhat")

// run this only on a local network
developmentChains.includes(network.name)
    ? describe.skip
    : describe("Raffle Unit test", () => {
          let raffle, deployer, vrfCoordinatorV2, entranceFee

          beforeEach(async () => {
              deployer = (await getNamedAccounts()).deployer // grab just the deployer object and assigned it to the deployer varx
              raffle = await ethers.getContract("Raffle")
              entranceFee = await raffle.getEntranceFee()
          })
          describe("fulfill random words", async () => {
              it("works with the live chainlink Keepers and the chainlink VRF, we get a random winner", async () => {
                  //enter the raffle
                  const startingTimeStamp = await raffle.getLastTimeStamp()
                  const accounts = await ethers.getSigners()
                  await new Promise(async (resolve, reject) => {
                      raffle.once("WinnerPicked", async () => {
                          console.log("Winner picked event fire")
                          try {
                              //add our asserts here
                              const recentWinner = await raffle.getRecentWinner()
                              const numberOfPlayers = await raffle.getNumberOfPlayers()
                              const raffleState = await raffle.getRaffleState()
                              const winnerEndingBalance = await accounts[0].getBalance()
                              const endingTimeStamp = await raffle.getLatestTimeStamp()
                              // check if players array is reseted because there will be no players object
                              await expect(raffle.getPlayer(0)).to.be.reverted
                              assert.equal(recentWinner.toString(), accounts[0].toString())
                              assert.equal(raffleState, 0)
                              assert.equal(
                                  winnerEndingBalance.toString(),
                                  winnerStartingBalance.add(entranceFee).toString()
                              )
                              assert(endingTimeStamp > startingTimeStamp)
                              resolve()
                          } catch (error) {
                              console.log(error)
                              reject(error)
                          }
                      })
                  })
                  // setup listener before we enter the raffle
                  // just in case the blockchain moves too fast
                  const winnerStartingBalance = await accounts[0].getBalance()
                  await raffle.enterRaffle({ value: entranceFee })
                  // this code wont complete untill our listener has finished listening
              })
          })
      })
