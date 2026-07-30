extends Node3D

const RUN_SECONDS := 180.0
const MOVE_SPEED := 28.0
const ACCELERATION := 62.0
const PULL_RADIUS := 30.0
const GUST_RADIUS := 48.0

var tornado: CharacterBody3D
var camera: Camera3D
var hud_label: Label
var ticker_label: Label
var remaining := RUN_SECONDS
var score := 0
var combo := 1.0
var power := 100.0
var breaking_text := "TORNADO TACTICAL GODOT FOUNDATION"
var velocity_planar := Vector3.ZERO

func _ready() -> void:
	_create_environment()
	_create_tornado()
	_create_camera()
	_create_hud()
	_create_test_targets()
	_create_flingable_cow()
	_create_safe_chaser()

func _physics_process(delta: float) -> void:
	remaining = maxf(0.0, remaining - delta)
	power = minf(100.0, power + 5.0 * delta)
	_update_movement(delta)
	_update_camera(delta)
	_handle_actions(delta)
	_update_hud()

func _update_movement(delta: float) -> void:
	var input_vector := Input.get_vector("move_left", "move_right", "move_up", "move_down")
	var desired := Vector3(input_vector.x, 0.0, input_vector.y) * MOVE_SPEED
	velocity_planar = velocity_planar.move_toward(desired, ACCELERATION * delta)
	tornado.velocity = velocity_planar
	tornado.move_and_slide()

func _update_camera(delta: float) -> void:
	var look_ahead := velocity_planar.limit_length(26.0) * 1.35
	var focus := tornado.global_position + look_ahead + Vector3.UP * 5.0
	var desired := focus + Vector3(0.0, 78.0, 110.0)
	camera.global_position = camera.global_position.lerp(desired, 1.0 - exp(-4.5 * delta))
	camera.look_at(focus, Vector3.UP)

func _handle_actions(delta: float) -> void:
	if Input.is_action_pressed("pull") and power > 0.5:
		power = maxf(0.0, power - 3.0 * delta)
		breaking_text = "PULL: INWARD ORBIT"
	if Input.is_action_just_pressed("gust") and power >= 14.0:
		power -= 14.0
		breaking_text = "GUST: OUTWARD SHOCKWAVE"
		_launch_nearby_animals()
	if Input.is_action_just_pressed("grid_zap") and power >= 20.0:
		power -= 20.0
		breaking_text = "GRID ZAP: CONDUCTIVE CHAIN"
		score += 100
		combo = minf(8.0, combo + 0.25)

func _launch_nearby_animals() -> void:
	for animal in get_tree().get_nodes_in_group("animals"):
		if animal is RigidBody3D and animal.global_position.distance_to(tornado.global_position) <= GUST_RADIUS:
			var direction := (animal.global_position - tornado.global_position).normalized()
			animal.freeze = false
			animal.apply_central_impulse(direction * 18.0 + Vector3.UP * 9.0)
			score += 100
			breaking_text = "BOVINE BALLISTIC"

func _create_environment() -> void:
	var world_environment := WorldEnvironment.new()
	var environment := Environment.new()
	environment.background_mode = Environment.BG_COLOR
	environment.background_color = Color("1d2b35")
	environment.ambient_light_source = Environment.AMBIENT_SOURCE_COLOR
	environment.ambient_light_color = Color("83949c")
	environment.ambient_light_energy = 0.8
	world_environment.environment = environment
	add_child(world_environment)

	var light := DirectionalLight3D.new()
	light.rotation_degrees = Vector3(-48.0, -36.0, 0.0)
	light.light_energy = 1.2
	light.shadow_enabled = true
	add_child(light)

	var ground := MeshInstance3D.new()
	var mesh := PlaneMesh.new()
	mesh.size = Vector2(800.0, 800.0)
	ground.mesh = mesh
	ground.material_override = _material(Color("18351d"))
	add_child(ground)

func _create_tornado() -> void:
	tornado = CharacterBody3D.new()
	tornado.name = "PlayerTornado"
	add_child(tornado)

	var visual := MeshInstance3D.new()
	var cone := CylinderMesh.new()
	cone.top_radius = 12.0
	cone.bottom_radius = 1.2
	cone.height = 28.0
	visual.mesh = cone
	visual.position.y = 14.0
	visual.material_override = _material(Color("28333c"))
	tornado.add_child(visual)

	var collision := CollisionShape3D.new()
	var shape := CylinderShape3D.new()
	shape.radius = 8.0
	shape.height = 28.0
	collision.shape = shape
	collision.position.y = 14.0
	tornado.add_child(collision)

func _create_camera() -> void:
	camera = Camera3D.new()
	camera.fov = 48.0
	camera.position = Vector3(0.0, 78.0, 110.0)
	add_child(camera)
	camera.current = true

func _create_hud() -> void:
	var layer := CanvasLayer.new()
	add_child(layer)

	ticker_label = Label.new()
	ticker_label.position = Vector2(0.0, 0.0)
	ticker_label.size = Vector2(1280.0, 36.0)
	ticker_label.horizontal_alignment = HORIZONTAL_ALIGNMENT_CENTER
	ticker_label.text = "TORNADO WARNING: GODOT MIGRATION FOUNDATION"
	layer.add_child(ticker_label)

	hud_label = Label.new()
	hud_label.position = Vector2(24.0, 54.0)
	hud_label.size = Vector2(520.0, 180.0)
	layer.add_child(hud_label)

func _create_test_targets() -> void:
	for index in range(12):
		var target := StaticBody3D.new()
		target.name = "DestructibleTarget%d" % index
		target.position = Vector3(38.0 + float(index % 4) * 13.0, 2.0, 12.0 + float(index / 4) * 15.0)
		var mesh_instance := MeshInstance3D.new()
		var box := BoxMesh.new()
		box.size = Vector3(9.0, 4.0, 8.0)
		mesh_instance.mesh = box
		mesh_instance.material_override = _material(Color("8b6d4a"))
		target.add_child(mesh_instance)
		var collision := CollisionShape3D.new()
		var shape := BoxShape3D.new()
		shape.size = box.size
		collision.shape = shape
		target.add_child(collision)
		add_child(target)

func _create_flingable_cow() -> void:
	var cow := RigidBody3D.new()
	cow.name = "InvincibleFlingableCow"
	cow.position = Vector3(18.0, 2.0, -10.0)
	cow.freeze = true
	cow.add_to_group("animals")
	var mesh_instance := MeshInstance3D.new()
	var box := BoxMesh.new()
	box.size = Vector3(3.2, 1.8, 1.5)
	mesh_instance.mesh = box
	mesh_instance.material_override = _material(Color("d8d3c5"))
	cow.add_child(mesh_instance)
	var collision := CollisionShape3D.new()
	var shape := BoxShape3D.new()
	shape.size = box.size
	collision.shape = shape
	cow.add_child(collision)
	add_child(cow)

func _create_safe_chaser() -> void:
	var chaser := MeshInstance3D.new()
	chaser.name = "SafeStormChaserSUV"
	chaser.position = Vector3(-55.0, 1.0, 48.0)
	var box := BoxMesh.new()
	box.size = Vector3(4.8, 1.5, 2.4)
	chaser.mesh = box
	chaser.material_override = _material(Color("24466f"))
	add_child(chaser)

func _update_hud() -> void:
	var minutes := int(remaining) / 60
	var seconds := int(remaining) % 60
	hud_label.text = "TORNADO TACTICAL GODOT\nTIME %02d:%02d   SCORE %d   COMBO %.1fx\nPOWER %.0f\n%s" % [minutes, seconds, score, combo, power, breaking_text]

func _material(color: Color) -> StandardMaterial3D:
	var material := StandardMaterial3D.new()
	material.albedo_color = color
	material.roughness = 0.8
	return material
