/*
 * This is an example of a Rust smart contract with two simple, symmetric functions:
 *
 * 1. set_greeting: accepts a greeting, such as "howdy", and records it for the user (account_id)
 *    who sent the request
 * 2. get_greeting: accepts an account_id and returns the greeting saved for it, defaulting to
 *    "Hello"
 *
 * Learn more about writing NEAR smart contracts with Rust:
 * https://github.com/near/near-sdk-rs
 *
 */

// To conserve gas, efficient serialization is achieved through Borsh (http://borsh.io/)
use near_sdk::borsh::{self, BorshDeserialize, BorshSerialize};
use near_sdk::{env, near_bindgen, setup_alloc};
use near_sdk::collections::LookupMap;
use near_sdk::{json_types::U128, AccountId, Promise};

setup_alloc!();

// Structs in Rust are similar to other languages, and may include impl keyword as shown below
// Note: the names of the structs are not important when calling the smart contract, but the function names are
#[near_bindgen]
#[derive(BorshDeserialize, BorshSerialize)]
pub struct Welcome {
    game: LookupMap<String, u8>,
    seed: Vec<u8>
}

impl Default for Welcome {
  fn default() -> Self {
    Self {
      game: LookupMap::new(b"a".to_vec()),
      seed: env::random_seed(), //0-255
    }
  }
}

#[near_bindgen]
impl Welcome {

    
    pub fn set_number(&mut self, number: u8) { //mutable (mut) para ser memory safe ao mudar alguma coisa
        let account_id = env::signer_account_id();

        // Use env::log to record logs permanently to the blockchain!
        env::log(format!("Saving number '{}' for account '{}'", number, account_id,).as_bytes());

        self.game.insert(&account_id, &number);
    }

    // `match` is similar to `switch` in other languages; here we use it to default to "Hello" if
    // self.records.get(&account_id) is not yet defined.
    pub fn get_greeting(&self, account_id: String) -> String { //nao é preciso porque "mutable" porque não quero mudar nada.
        match self.game.get(&account_id) { //switch case
            Some(greeting) => format!("{}", greeting),
            None => "Hello".to_string(),
        }
    }

    pub fn pay() -> Promise {
        let amount: u128 = 1_000_000_000_000_000_000_000_000; // 1 $NEAR as yoctoNEAR
        let to: AccountId = env::signer_account_id(); //env::current_account_id() //"ertemo.testnet".parse().unwrap();
        Promise::new(to).transfer(amount)
    }
/*
    #[payable]
    pub fn transfer(&mut self){ //, new_owner_id: AccountId, amount: U128) {
        // NOTE: New owner's Account ID checked in transfer_from.
        // Storage fees are also refunded in transfer_from.
        Promise::transfer_from(env::predecessor_account_id(), env::current_account_id(), 1_000_000_000_000_000_000_000_000);
    } */

    #[payable]
    pub fn take_my_money(&mut self) {
        assert!(env::attached_deposit()==1_000_000_000_000_000_000_000_000, "Owner's method");
        env::log(format!("{:?}", env::attached_deposit()).as_bytes());
    }

    //true = heads, false = tails
    #[payable]
    pub fn coin_flip(&mut self, option: bool) -> &str {
        let amount: u128 = 1_000_000_000_000_000_000_000_000;

        assert!(env::attached_deposit()==amount, "Owner's method");
        let seed = env::random_seed();
        let rng = env::sha256(seed.as_slice());

        env::log(format!("Random seed: {:?}", seed).as_bytes());
        //env::log(format!("{:?}", rng).as_bytes());


        let result = rng.as_slice()[0] % 2 == 0;
        env::log(format!("{:?}", result).as_bytes());
        //return result; //returns true 50% of the time otherwise false
        if result == option{
            let to: AccountId = env::signer_account_id(); //env::current_account_id() //"ertemo.testnet".parse().unwrap();
            Promise::new(to).transfer(amount);
            return "you won";
        }
        return "get rugged xd lmao";
    }



    pub fn resultslog(&self, max: u8) -> u8 {
        assert!(max > 0);
        let rng = (env::sha256(self.seed.as_slice())).as_slice()[0]; //0 - 255
        //env::log(format!("Random seed: {:?}", self.seed).as_bytes());

        let result = rng % max;
        env::log(format!("{:?}", result).as_bytes());
        return result+1; // (+1) to give a number between 1 and 256
    }

    
    pub fn gen_game(&self, account_id_p1: String, account_id_p2: String) ->String {
        let firstplayer_result = (env::sha256(self.seed.as_slice())).as_slice()[0] % 2 == 0;
        let firstplayer = if firstplayer_result { account_id_p1 } else { account_id_p2 };
        env::log(format!("{:?}", firstplayer).as_bytes());


        

        return firstplayer;
    }
}

#[cfg(test)]
mod tests{

    /* testing */ 
    pub fn get_seed(&self) -> Vec<u8> {
        return self.seed.clone();
    }

}