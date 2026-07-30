extends Node3D

const RUN_DURATION := 180.0
const MOVE_SPEED := 28.0
const ACCELERATION := 62.0
const PULL_RADIUS := 30.0
const GUST_RADIUS := 48.0
const GRID_RADIUS := 62.0

var tornado: Node3D
var camera: Camera3D
var velocity := Vector3.ZERO
var remaining := RUN_DURATION
var score := 0
var combo := 1.0
var combo_hold := 0.0
var ef_rating := "EF-0"
var run_ended := false
var cow: Node3D
var cow_velocity := Vector3.ZERO
var cow_airborne := false
var cow_orbit_angle := 0.0
var chaser: Node3D
var ticker_label: Label
var status_label: Label
var breaking_label: Label

func _ready() -> void:
	_build_environment()
	_build_ground()
	_build_tornado()
	_build_camera()
	_build_test_district()
	_build_cow()
	_build_chaser()
	_build_hud()
	_set_ticker("TORNADO WARNING: TOUCHDOWN CONFIRMED IN LINCOLN COUNTY")

func _physics_process(delta: float) -> void:
	if run_ended:
		return
	_update_movement(delta)
	_update_abilities(delta)
	_update_cow(delta)
	_update_chaser(delta)
	_update_camera(delta)
	_update_run(delta)
	_update_hud()

func _build_environment() -> void:
	var world_environment := WorldEnvironment.new()
	var environment := Environment.new()
	environment.background_mode = Environment.BG_COLOR
	environment.background_color = Color("#263746")
	environment.ambient_light_source = Environment.AMBIENT_SOURCE_COLOR
	environment.ambient_light_color = Color("#7b8992")
	environment.ambient_light_energy = 0.65
	environment.fog_enabled = true
	environment.fog_light_color = Color("#657985")
	environment.fog_density = 0.003
	world_environment.environment = environment
	add_child(world_environment)

	var sun := DirectionalLight3D.new()
	sun.rotation_degrees = Vector3(-48.0, -36.0, 0.0)
	sun.light_energy = 1.2
	sun.shadow_enabled = true
	add_child(sun)

func _build_ground() -> void:
	var ground := StaticBody3D.new()
	ground.name = "County Ground"
	var mesh_instance := MeshInstance3D.new()
	var mesh := BoxMesh.new()
	mesh.size = Vector3(520.0, 0.5, 520.0)
	mesh_instance.mesh = mesh
	mesh_instance.material_override = _material(Color("#28452b"), 0.9)
	ground.add_child(mesh_instance)
	var collider := CollisionShape3D.new()
	var shape := BoxShape3D.new()
	shape.size = mesh.size
	collider.shape = shape
	ground.add_child(collider)
	ground.position.y = -0.25
	add_child(ground)

func _build_tornado() -> void:
	tornado = Node3D.new()
	tornado.name = "Player Tornado"
	tornado.position = Vector3(-35.0, 0.0, 25.0)
	add_child(tornado)

	var funnel := MeshInstance3D.new()
	var funnel_mesh := CylinderMesh.new()
	funnel_mesh.top_radius = 8.5
	funnel_mesh.bottom_radius = 1.0
	funnel_mesh.height = 25.0
	funnel_mesh.radial_segments = 32
	funnel.mesh = funnel_mesh
	funnel.position.y = 12.5
	funnel.material_override = _material(Color(0.08, 0.11, 0.15, 0.78), 0.15, true)
	tornado.add_child(funnel)

	var outer := MeshInstance3D.new()
	var outer_mesh := CylinderMesh.new()
	outer_mesh.top_radius = 12.5
	outer_mesh.bottom_radius = 2.0
	outer_mesh.height = 27.0
	outer_mesh.radial_segments = 24
	outer.mesh = outer_mesh
	outer.position.y = 13.5
	outer.material_override = _material(Color(0.3, 0.38, 0.45, 0.25), 0.25, true)
	tornado.add_child(outer)

func _build_camera() -> void:
	camera = Camera3D.new()
	camera.name = "Tactical Camera"
	camera.fov = 48.0
	camera.current = true
	add_child(camera)
	_update_camera(1.0)

func _build_test_district() -> void:
	var root := Node3D.new()
	root.name = "Tactical Destruction Block"
	add_child(root)
	var center := tornado.position + Vector3(42.0, 0.0, 8.0)
	for i in range(16):
		var x := float(i % 4) * 13.0 - 19.5
		var z := float(i / 4) * 14.0 - 21.0
		var building := _make_box(
			"Tactical Building %d" % i,
			center + Vector3(x, 2.5, z),
			Vector3(9.0, 5.0, 8.0),
			Color("#a37d55")
		)
		building.set_meta("health", 70.0 + i * 4.0)
		building.add_to_group("destructible")
		root.add_child(building)

	for i in range(6):
		var pole := _make_box(
			"Power Pole %d" % i,
			center + Vector3(-32.0 + i * 13.0, 4.5, 32.0),
			Vector3(0.8, 9.0, 0.8),
			Color("#5d4934")
		)
		pole.set_meta("health", 55.0)
		pole.add_to_group("destructible")
		pole.add_to_group("conductive")
		root.add_child(pole)

func _build_cow() -> void:
	cow = Node3D.new()
	cow.name = "Invincible Flingable Cow"
	cow.position = tornado.position + Vector3(18.0, 0.0, -10.0)
	add_child(cow)
	cow.add_child(_visual_box(Vector3(3.2, 1.8, 1.5), Vector3(0.0, 1.5, 0.0), Color("#e4dfd2")))
	cow.add_child(_visual_box(Vector3(1.1, 1.1, 1.1), Vector3(2.0, 1.7, 0.0), Color("#24201d")))
	for i in range(4):
		var lx := -1.0 if i < 2 else 1.0
		var lz := -0.55 if i % 2 == 0 else 0.55
		cow.add_child(_visual_box(Vector3(0.32, 1.1, 0.32), Vector3(lx, 0.45, lz), Color("#24201d")))

func _build_chaser() -> void:
	chaser = Node3D.new()
	chaser.name = "Safe Storm Chaser SUV"
	chaser.position = tornado.position + Vector3(-55.0, 0.0, 48.0)
	add_child(chaser)
	chaser.add_child(_visual_box(Vector3(4.8, 1.5, 2.4), Vector3(0.0, 1.1, 0.0), Color("#1f456d")))
	chaser.add_child(_visual_box(Vector3(2.8, 1.2, 2.1), Vector3(0.5, 2.1, 0.0), Color("#3f93b6")))
	chaser.add_child(_visual_box(Vector3(0.18, 1.7, 0.18), Vector3(-0.5, 3.3, 0.0), Color("#202a32")))

func _build_hud() -> void:
	var canvas := CanvasLayer.new()
	add_child(canvas)

	var ticker_panel := ColorRect.new()
	ticker_panel.color = Color(0.62, 0.06, 0.06, 0.94)
	ticker_panel.set_anchors_and_offsets_preset(Control.PRESET_TOP_WIDE)
	ticker_panel.custom_minimum_size.y = 38.0
	canvas.add_child(ticker_panel)

	ticker_label = Label.new()
	ticker_label.horizontal_alignment = HORIZONTAL_ALIGNMENT_CENTER
	ticker_label.vertical_alignment = VERTICAL_ALIGNMENT_CENTER
	ticker_label.set_anchors_and_offsets_preset(Control.PRESET_FULL_RECT)
	ticker_label.add_theme_font_size_override("font_size", 17)
	ticker_panel.add_child(ticker_label)

	var info_panel := ColorRect.new()
	info_panel.color = Color(0.02, 0.05, 0.08, 0.86)
	info_panel.position = Vector2(16.0, 52.0)
	info_panel.size = Vector2(430.0, 142.0)
	canvas.add_child(info_panel)

	status_label = Label.new()
	status_label.position = Vector2(14.0, 10.0)
	status_label.size = Vector2(400.0, 118.0)
	status_label.add_theme_font_size_override("font_size", 18)
	info_panel.add_child(status_label)

	breaking_label = Label.new()
	breaking_label.horizontal_alignment = HORIZONTAL_ALIGNMENT_CENTER
	breaking_label.position = Vector2(0.0, 205.0)
	breaking_label.size = Vector2(1280.0, 40.0)
	breaking_label.add_theme_font_size_override("font_size", 24)
	canvas.add_child(breaking_label)

func _update_movement(delta: float) -> void:
	var input_2d := Input.get_vector("move_left", "move_right", "move_forward", "move_back")
	var forward := -camera.global_transform.basis.z
	forward.y = 0.0
	forward = forward.normalized()
	var right := camera.global_transform.basis.x
	right.y = 0.0
	right = right.normalized()
	var desired := (right * input_2d.x + forward * -input_2d.y).normalized() * MOVE_SPEED
	velocity = velocity.move_toward(desired, ACCELERATION * delta)
	tornado.position += velocity * delta
	tornado.position.x = clamp(tornado.position.x, -240.0, 240.0)
	tornado.position.z = clamp(tornado.position.z, -240.0, 240.0)
	tornado.rotate_y(delta * 2.8)

func _update_abilities(delta: float) -> void:
	if Input.is_action_pressed("pull"):
		_apply_pull(delta)
	if Input.is_action_just_pressed("gust"):
		_apply_gust()
	if Input.is_action_just_pressed("grid_zap"):
		_apply_grid_zap()

func _apply_pull(delta: float) -> void:
	for target in get_tree().get_nodes_in_group("destructible"):
		if not is_instance_valid(target):
			continue
		var offset: Vector3 = tornado.global_position - target.global_position
		if offset.length() <= PULL_RADIUS:
			target.global_position += (offset.normalized() * 9.0 + Vector3.UP * 2.0) * delta
			_damage_target(target, 18.0 * delta, "PULL")
	if cow.global_position.distance_to(tornado.global_position) <= PULL_RADIUS * 1.25:
		cow_airborne = true
		cow_velocity = Vector3.ZERO

func _apply_gust() -> void:
	var hits := 0
	for target in get_tree().get_nodes_in_group("destructible"):
		if not is_instance_valid(target):
			continue
		var offset: Vector3 = target.global_position - tornado.global_position
		if offset.length() <= GUST_RADIUS:
			target.global_position += offset.normalized() * 4.0 + Vector3.UP * 1.2
			target.rotate(Vector3(0.4, 1.0, 0.2).normalized(), 0.22)
			_damage_target(target, 34.0, "GUST")
			hits += 1
	if cow.global_position.distance_to(tornado.global_position) <= GUST_RADIUS:
		var outward := cow.global_position - tornado.global_position
		outward.y = 0.0
		if outward.length_squared() < 0.01:
			outward = Vector3.FORWARD
		cow_airborne = true
		cow_velocity = outward.normalized() * 30.0 + Vector3.UP * 12.0
		_show_breaking("BOVINE BALLISTIC")
	if hits > 0:
		_show_breaking("GUST IMPACT: %d TARGETS" % hits)

func _apply_grid_zap() -> void:
	var chain := 0
	for target in get_tree().get_nodes_in_group("conductive"):
		if not is_instance_valid(target):
			continue
		if target.global_position.distance_to(tornado.global_position) <= GRID_RADIUS and chain < 4:
			_damage_target(target, 95.0 - chain * 15.0, "GRID ZAP")
			chain += 1
	if chain > 0:
		_show_breaking("POWER FLASHES: %d-NODE GRID CASCADE" % chain)
	else:
		_show_breaking("NO CONDUCTIVE TARGET")

func _damage_target(target: Node3D, amount: float, source: String) -> void:
	var health := float(target.get_meta("health", 1.0)) - amount
	target.set_meta("health", health)
	_add_score(maxi(1, int(amount * 0.4)), source)
	if health <= 0.0:
		target.remove_from_group("destructible")
		target.remove_from_group("conductive")
		target.scale.y = 0.18
		target.position.y = 0.45
		_add_score(100, "DESTROYED")

func _add_score(points: int, source: String) -> void:
	if points <= 0:
		return
	score += int(round(points * combo))
	combo = minf(8.0, combo + clampf(points / 120.0, 0.08, 0.7))
	combo_hold = 2.8
	_update_ef_rating()
	if chaser.global_position.distance_to(tornado.global_position) <= 92.0:
		var bonus := clampi(int(points * 0.2), 5, 100)
		score += bonus
		_show_breaking("CAUGHT ON CAMERA +%d" % bonus)
	_set_ticker("LIVE: %s DAMAGE REPORTED NEAR THE TACTICAL TEST DISTRICT" % source)

func _update_ef_rating() -> void:
	var next_rating := "EF-0"
	var scale_value := 1.0
	if score > 2200:
		next_rating = "EF-5 WEDGE"
		scale_value = 1.7
	elif score > 1400:
		next_rating = "EF-4"
		scale_value = 1.5
	elif score > 850:
		next_rating = "EF-3"
		scale_value = 1.35
	elif score > 400:
		next_rating = "EF-2"
		scale_value = 1.2
	elif score > 150:
		next_rating = "EF-1"
		scale_value = 1.1
	if next_rating != ef_rating:
		ef_rating = next_rating
		tornado.scale = Vector3.ONE * scale_value
		_show_breaking("BREAKING: %s DAMAGE CONFIRMED" % ef_rating)

func _update_cow(delta: float) -> void:
	if not cow_airborne:
		return
	if cow_velocity.length_squared() > 0.01:
		cow_velocity += Vector3.DOWN * 5.1 * delta
		cow.position += cow_velocity * delta
		cow.rotate(Vector3(1.0, 0.7, 0.45).normalized(), 7.2 * delta)
		if cow.position.y <= 0.0 and cow_velocity.y <= 0.0:
			_land_cow()
	else:
		cow_orbit_angle += 2.5 * delta
		var orbit := Vector3(cos(cow_orbit_angle) * 7.0, 10.0, sin(cow_orbit_angle) * 7.0)
		cow.global_position = tornado.global_position + orbit
		cow.rotate(Vector3(0.35, 1.0, 0.55).normalized(), 3.0 * delta)

func _land_cow() -> void:
	cow_airborne = false
	cow_velocity = Vector3.ZERO
	cow.position.y = 0.0
	cow.rotation = Vector3.ZERO
	_show_breaking("COW LANDED SAFELY")

func _update_chaser(delta: float) -> void:
	var away := chaser.global_position - tornado.global_position
	away.y = 0.0
	var distance := away.length()
	if distance < 48.0:
		var direction := away.normalized() if distance > 0.1 else Vector3.RIGHT
		chaser.position += direction * 34.0 * delta
		chaser.look_at(chaser.global_position + direction, Vector3.UP)
		_set_ticker("STORM CHASERS REPOSITIONING TO A SAFE OBSERVATION ROUTE")
	elif distance > 105.0:
		var observation_point := tornado.global_position + away.normalized() * 82.0
		chaser.global_position = chaser.global_position.move_toward(observation_point, 12.0 * delta)

func _update_camera(delta: float) -> void:
	if camera == null or tornado == null:
		return
	var look_ahead := velocity.limit_length(26.0) * 1.35
	var focus := tornado.global_position + look_ahead + Vector3.UP * 5.0
	var desired := focus + Vector3(0.0, 78.0, 110.0)
	camera.global_position = camera.global_position.lerp(desired, 1.0 - exp(-4.2 * delta))
	camera.look_at(focus, Vector3.UP)

func _update_run(delta: float) -> void:
	remaining = maxf(0.0, remaining - delta)
	combo_hold = maxf(0.0, combo_hold - delta)
	if combo_hold <= 0.0:
		combo = move_toward(combo, 1.0, delta * 0.9)
	if remaining <= 0.0:
		run_ended = true
		_set_ticker("FINAL REPORT: %s | SCORE %d | ALL ANIMALS SAFE" % [ef_rating, score])
		_show_breaking("RUN COMPLETE: LOCAL NEWS DAMAGE RECAP")

func _update_hud() -> void:
	var minutes := int(remaining) / 60
	var seconds := int(remaining) % 60
	status_label.text = "TORNADO TACTICAL  %s\nTIME %02d:%02d   SCORE %,d   COMBO %.1fx\nPULL: SPACE   GUST: Q   GRID ZAP: E\nCOW: %s   CHASER: SAFE" % [ef_rating, minutes, seconds, score, combo, "AIRBORNE" if cow_airborne else "SAFE"]

func _set_ticker(message: String) -> void:
	if ticker_label != null:
		ticker_label.text = message

func _show_breaking(message: String) -> void:
	if breaking_label == null:
		return
	breaking_label.text = message
	var timer := get_tree().create_timer(2.2)
	timer.timeout.connect(func():
		if breaking_label.text == message:
			breaking_label.text = ""
	)

func _make_box(object_name: String, position_value: Vector3, size: Vector3, color: Color) -> StaticBody3D:
	var body := StaticBody3D.new()
	body.name = object_name
	body.position = position_value
	body.add_child(_visual_box(size, Vector3.ZERO, color))
	var collision := CollisionShape3D.new()
	var shape := BoxShape3D.new()
	shape.size = size
	collision.shape = shape
	body.add_child(collision)
	return body

func _visual_box(size: Vector3, local_position: Vector3, color: Color) -> MeshInstance3D:
	var mesh_instance := MeshInstance3D.new()
	var mesh := BoxMesh.new()
	mesh.size = size
	mesh_instance.mesh = mesh
	mesh_instance.position = local_position
	mesh_instance.material_override = _material(color, 0.65)
	return mesh_instance

func _material(color: Color, roughness: float, transparent := false) -> StandardMaterial3D:
	var material := StandardMaterial3D.new()
	material.albedo_color = color
	material.roughness = roughness
	if transparent:
		material.transparency = BaseMaterial3D.TRANSPARENCY_ALPHA
	return material
