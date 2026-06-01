pub mod matchmaking;
pub mod players;
pub mod rating_scaler;
pub mod roles;
pub mod teams;

use matchmaking::{BalancerResult, Matchmaking};
use players::Players;
use serde::{Deserialize, Serialize};
use teams::Teams;
use wasm_bindgen::prelude::*;

/// Serialize a value to a JsValue, encoding maps as plain JS objects
/// (matches the legacy `JsValue::from_serde` behaviour).
fn to_js<T: Serialize>(value: &T) -> JsValue {
    let serializer =
        serde_wasm_bindgen::Serializer::new().serialize_maps_as_objects(true);
    value.serialize(&serializer).unwrap()
}

/// Deserialize a JsValue into a Rust type.
fn from_js<T: serde::de::DeserializeOwned>(value: &JsValue) -> T {
    serde_wasm_bindgen::from_value(value.clone()).unwrap()
}

#[cfg(feature = "wee_alloc")]
#[global_allocator]
static ALLOC: wee_alloc::WeeAlloc = wee_alloc::WeeAlloc::INIT;

#[derive(Serialize, Deserialize)]
struct ReserveData(pub Vec<String>);

#[derive(Serialize, Deserialize, Debug)]
pub struct Point {
    pub x: f64,
    pub y: f64,
}

#[derive(Serialize, Deserialize, Debug)]
pub struct BezierPoint {
    pub position: Point,
    pub control: Point,
}

#[derive(Debug, Serialize, Deserialize)]
pub struct SpecializationPoints {
    pub any: Vec<BezierPoint>,
    pub primary: Vec<BezierPoint>,
    pub secondary: Vec<BezierPoint>,
}

#[derive(Serialize, Deserialize, Debug)]
#[serde(rename_all = "camelCase")]
pub struct AdjustSr {
    pub dps: SpecializationPoints,
    pub tank: SpecializationPoints,
    pub support: SpecializationPoints,
    pub is_enabled: bool,
}

#[wasm_bindgen(module = "/logger.js")]
extern "C" {
    pub fn wasm_log(message: String);
}

#[wasm_bindgen(start)]
pub fn main_js() -> Result<(), JsValue> {
    console_error_panic_hook::set_once();
    Ok(())
}

pub fn run_matchmaking(
    player_data: &JsValue,
    tolerance: u32,
    rank_limiter: bool,
    duplicate_roles: bool,
    prefer_balanced_captains: bool,
    prefer_full_flex_distribution: bool,
    prevent_superteam_synergy: bool,
    adjust_sr: &JsValue,
    disable_type: String,
    dispersion_minimizer: bool,
) -> BalancerResult {
    let mut players: Players = from_js(player_data);
    let adjust: AdjustSr = from_js(adjust_sr);
    players.adjust_sr(adjust);

    let mut matchmaking = Matchmaking::new(
        &players,
        tolerance,
        rank_limiter,
        duplicate_roles,
        prefer_balanced_captains,
        prefer_full_flex_distribution,
        prevent_superteam_synergy,
    );

    matchmaking.set_disable_type(disable_type.clone());

    if dispersion_minimizer {
        matchmaking.enable_dispersion_minimizer();
    }

    matchmaking.balance_players();
    matchmaking.result()
}

#[wasm_bindgen]
pub fn balance(
    player_data: &JsValue,
    tolerance: u32,
    rank_limiter: bool,
    duplicate_roles: bool,
    prefer_balanced_captains: bool,
    prefer_full_flex_distribution: bool,
    prevent_superteam_synergy: bool,
    adjust_sr: &JsValue,
    disable_type: String,
    dispersion_minimizer: bool,
    tries_count: u32,
) -> JsValue {
    let mut results = Vec::default();
    let mut success_flag = false;

    for _ in 0..tries_count {
        let result = run_matchmaking(
            player_data,
            tolerance,
            rank_limiter,
            duplicate_roles,
            prefer_balanced_captains,
            prefer_full_flex_distribution,
            prevent_superteam_synergy,
            adjust_sr,
            disable_type.clone(),
            dispersion_minimizer,
        );

        if result.leftovers.0.len() == 0 && !success_flag {
            success_flag = true;
        }

        if success_flag && result.leftovers.0.len() > 0 {
            continue;
        }

        results.push(result);
    }

    if success_flag {
        results.retain(|result| result.leftovers.0.len() == 0);
    }

    to_js(&results)
}

#[wasm_bindgen]
pub fn balance_half(
    player_data: &JsValue,
    tolerance: u32,
    rank_limiter: bool,
    duplicate_roles: bool,
    prefer_balanced_captains: bool,
    prefer_full_flex_distribution: bool,
    prevent_superteam_synergy: bool,
    adjust_sr: &JsValue,
) -> JsValue {
    let mut players: Players = from_js(player_data);
    let adjust: AdjustSr = from_js(adjust_sr);
    players.adjust_sr(adjust);

    let mut matchmaking = Matchmaking::new(
        &players,
        tolerance,
        rank_limiter,
        duplicate_roles,
        prefer_balanced_captains,
        prefer_full_flex_distribution,
        prevent_superteam_synergy,
    );

    matchmaking.balance_half();

    let mut results = Vec::default();
    results.push(matchmaking.result());

    to_js(&results)
}

#[wasm_bindgen]
pub fn balance_final(
    player_data: &JsValue,
    tolerance: u32,
    rank_limiter: bool,
    duplicate_roles: bool,
    prefer_balanced_captains: bool,
    prefer_full_flex_distribution: bool,
    prevent_superteam_synergy: bool,
    reserve_data: &JsValue,
    teams_data: &JsValue,
    adjust_sr: &JsValue,
) -> JsValue {
    let mut players: Players = from_js(player_data);
    let adjust: AdjustSr = from_js(adjust_sr);
    players.adjust_sr(adjust);

    let teams: Teams = from_js(teams_data);
    let reserve: ReserveData = from_js(reserve_data);

    let mut matchmaking = Matchmaking::new(
        &players,
        tolerance,
        rank_limiter,
        duplicate_roles,
        prefer_balanced_captains,
        prefer_full_flex_distribution,
        prevent_superteam_synergy,
    );

    matchmaking.add_reserve(reserve.0);
    matchmaking.add_teams(teams);
    matchmaking.balance_remaining();

    let mut results = Vec::default();
    results.push(matchmaking.result());

    to_js(&results)
}